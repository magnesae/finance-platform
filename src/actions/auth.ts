'use server';

import { z } from 'zod';
import { signUpSchema } from '@/lib/schemas/authSchemas';
import { db, userTable } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { generateIdFromEntropySize } from 'lucia';
import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

// export async function signInAction(
//   _prevState: any,
//   formData: FormData,
// ): Promise<any> {
//   const data = Object.fromEntries(formData);
//   const parsed = signInSchema.safeParse(data);

//   if (!parsed.success) {
//     const err = parsed.error.flatten();
//     return {
//       fieldError: {
//         email: err.fieldErrors.username?.[0],
//         password: err.fieldErrors.password?.[0],
//       },
//     };
//   }

//   const { username, password } = parsed.data;

//   const existingUser = await db.query.users.findFirst({
//     where: (table, { eq }) => eq(table.email, email),
//   });

//   if (!existingUser) {
//     return {
//       formError: 'Incorrect email or password',
//     };
//   }

//   if (!existingUser || !existingUser?.hashedPassword) {
//     return {
//       formError: 'Incorrect email or password',
//     };
//   }

//   const validPassword = await new Scrypt().verify(
//     existingUser.hashedPassword,
//     password,
//   );
//   if (!validPassword) {
//     return {
//       formError: 'Incorrect email or password',
//     };
//   }

//   const session = await lucia.createSession(existingUser.id, {});
//   const sessionCookie = lucia.createSessionCookie(session.id);
//   cookies().set(
//     sessionCookie.name,
//     sessionCookie.value,
//     sessionCookie.attributes,
//   );
//   return redirect(redirects.afterLogin);
// }

type actionResult = {
  fieldError?: { username?: string; password?: string };
  formError?: string;
};

export async function signUpAction(
  _prevState: any,
  formData: FormData,
): Promise<actionResult> {
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
      formError: 'Passwords do not match',
    };
  }
  const passwordHash = await Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 19 * 1024,
    timeCost: 2,
  });

  const userId = generateIdFromEntropySize(10);

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, username));

  if (existingUser) {
    return {
      formError: 'Username already exists',
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

  return redirect('/');
}
