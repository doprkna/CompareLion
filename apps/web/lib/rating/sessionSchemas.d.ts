/**
 * Rating Session Zod Schemas
 * Validation schemas for Rating Session API endpoints
 * v0.38.17 - Batch Rating Mode
 */
import { z } from 'zod';
export declare const StartSessionSchema: z.ZodObject<{
    category: z.ZodString;
    totalItems: z.ZodNumber;
}, z.core.$strip>;
export declare const CompleteItemSchema: z.ZodObject<{
    sessionItemId: z.ZodString;
    requestId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    skipped: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type CompleteItemInput = z.infer<typeof CompleteItemSchema>;
