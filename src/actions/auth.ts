"use server";

import { users } from "@/db/schema";
import { lucia, validateRequest } from "@/lib/auth";
import { db } from "@/lib/db.psql";
import { signInSchema, signUpSchema } from "@/lib/schemas/authSchemas";
import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    .from(users)
    .where(eq(users.username, username));

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

  const validPassword = await verify(existingUser.password, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

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

  // const passwordHash = await Bun.password.hash(password, {
  //   algorithm: "argon2id",
  //   memoryCost: 19 * 1024,
  //   timeCost: 2,
  // });

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const userId = generateIdFromEntropySize(10);

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (existingUser) {
    return {
      formError: "Username already exists",
    };
  }

  await db.insert(users).values({
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
