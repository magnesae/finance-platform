import { z } from "zod";

export const signUpSchema = z.object({
  username: z.string().trim().min(2).max(50),
  password: z.string().trim().min(2).max(50),
  confirmPassword: z.string().trim().min(2).max(50),
});

export const signInSchema = z.object({
  username: z.string().trim().min(2).max(50),
  password: z.string().trim().min(2).max(50),
});
