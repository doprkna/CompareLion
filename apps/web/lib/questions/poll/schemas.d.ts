/**
 * Poll Question Zod Schemas
 * Validation schemas for Poll Question API endpoints
 * v0.37.4 - Poll Option Feature
 */
import { z } from 'zod';
/**
 * Create Poll Schema
 */
export declare const CreatePollSchema: z.ZodObject<{
    questionId: z.ZodString;
    options: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
/**
 * Vote Poll Schema
 */
export declare const VotePollSchema: z.ZodObject<{
    questionId: z.ZodString;
    optionId: z.ZodString;
}, z.core.$strip>;
/**
 * Type exports for TypeScript
 */
export type CreatePollInput = z.infer<typeof CreatePollSchema>;
export type VotePollInput = z.infer<typeof VotePollSchema>;
