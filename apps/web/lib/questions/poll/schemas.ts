/**
 * Poll Question Zod Schemas
 * Validation schemas for Poll Question API endpoints
 * v0.37.4 - Poll Option Feature
 */

import { z } from 'zod';

/**
 * Create Poll Schema
 */
export const CreatePollSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  options: z.array(z.string().min(1, 'Option text cannot be empty')).min(2, 'At least 2 options required').max(10, 'Maximum 10 options allowed'),
});

/**
 * Vote Poll Schema
 */
export const VotePollSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  optionId: z.string().min(1, 'Option ID is required'),
});

/**
 * Type exports for TypeScript
 */
export type CreatePollInput = z.infer<typeof CreatePollSchema>;
export type VotePollInput = z.infer<typeof VotePollSchema>;

