/**
 * Skip Question Zod Schemas
 * Validation schemas for Skip Question API endpoints
 * v0.37.2 - Skip Question Feature
 */

import { z } from 'zod';

/**
 * Skip Question Schema
 */
export const SkipQuestionSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
});

/**
 * Type exports for TypeScript
 */
export type SkipQuestionInput = z.infer<typeof SkipQuestionSchema>;

