import { z } from 'zod';

// RFC 5322 compliant email regex (simplified but covers most cases)
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const SignupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .regex(emailRegex, 'Invalid email format')
    .transform(email => email.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must contain at least one letter and one number'),
  hcaptchaToken: z.string().optional(), // Optional hCaptcha token for rate-limited signups
});

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .transform(email => email.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required'),
  hcaptchaToken: z.string().optional(), // Optional hCaptcha token for rate-limited logins
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;