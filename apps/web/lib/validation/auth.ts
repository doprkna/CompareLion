import { z } from 'zod';

export const SignupSchema = z.object({
  username: z.string().email(),
  password: z.string().min(1).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
