/**
 * VS Mode Zod Schemas
 * Validation schemas for VS Mode API endpoints
 * v0.38.16 - VS Mode
 */

import { z } from 'zod';

export const CreateVsRequestSchema = z.object({
  leftImageUrl: z.string().url('Left image URL must be a valid URL'),
  rightImageUrl: z.string().url('Right image URL must be a valid URL'),
  category: z.string().min(1, 'Category is required'),
});

export const VoteVsSchema = z.object({
  vsId: z.string().min(1, 'VS ID is required'),
  choice: z.enum(['left', 'right'], {
    errorMap: () => ({ message: 'Choice must be "left" or "right"' }),
  }),
});

export type CreateVsRequestInput = z.infer<typeof CreateVsRequestSchema>;
export type VoteVsInput = z.infer<typeof VoteVsSchema>;

