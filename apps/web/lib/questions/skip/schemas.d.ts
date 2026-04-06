/**
 * Skip Question Zod Schemas
 * Validation schemas for Skip Question API endpoints
 * v0.37.2 - Skip Question Feature
 */
import { z } from 'zod';
/**
 * Skip Question Schema
 */
export declare const SkipQuestionSchema: z.ZodObject<{
    questionId: z.ZodString;
}, z.core.$strip>;
/**
 * Type exports for TypeScript
 */
export type SkipQuestionInput = z.infer<typeof SkipQuestionSchema>;
