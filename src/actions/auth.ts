"use server";

import { signUpSchema, signInSchema } from "@/lib/schemas/authSchemas";
import { db, userTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { generateIdFromEntropySize } from "lucia";
import { lucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

type ActionResult = {
  fieldError?: { username?: string; password?: string };
  formError?: string;
};

export async function signInAction(
  _prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const data = Object.fromEntries(formData);
  const parsed = signInSchema.safeParse(data);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        username: err.fieldErrors.username?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { username, password } = parsed.data;

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username));

  if (!existingUser) {
    return {
      formError: "Incorrect userame or password",
    };
  }

  if (!existingUser || !existingUser?.password) {
    return {
      formError: "Incorrect userame or password",
    };
  }

  const validPassword = await Bun.password.verify(
    password,
    existingUser.password,
  );

  if (!validPassword) {
    return {
      formError: "Incorrect username or password",
    };
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/");
}

export async function signUpAction(
  _prevState: any,
  formData: FormData,
): Promise<ActionResult> {
  const data = Object.fromEntries(formData);
  const parsed = signUpSchema.safeParse(data);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        username: err.fieldErrors.username?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { username, password, confirmPassword } = parsed.data;

  if (password !== confirmPassword) {
    return {
      formError: "Passwords do not match",
    };
  }

  const passwordHash = await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 19 * 1024,
    timeCost: 2,
  });

  const userId = generateIdFromEntropySize(10);

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username));

  if (existingUser) {
    return {
      formError: "Username already exists",
    };
  }

  await db.insert(userTable).values({
    id: userId,
    username: username,
    password: passwordHash,
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/");
}

export async function signOut(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      formError: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/sign-in");
}
