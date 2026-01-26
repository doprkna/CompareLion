/**
 * Photo Challenge Zod Schemas
 * Validation schemas for Photo Challenge API endpoints
 * v0.37.12 - Photo Challenge
 */

import { z } from 'zod';

/**
 * Vote on Entry Schema
 */
export const VoteEntrySchema = z.object({
  entryId: z.string().min(1, 'Entry ID is required'),
  voteType: z.enum(['appeal', 'creativity'], {
    errorMap: () => ({ message: 'Vote type must be "appeal" or "creativity"' }),
  }),
});

/**
 * Get Entries Query Schema
 */
export const GetEntriesQuerySchema = z.object({
  category: z.string().optional(),
});

/**
 * Scam Flag Schema
 */
export const ScamFlagSchema = z.object({
  entryId: z.string().min(1, 'Entry ID is required'),
  reason: z.enum(['watermark', 'stock', 'ai', 'meme', 'other'], {
    errorMap: () => ({ message: 'Reason must be one of: watermark, stock, ai, meme, other' }),
  }),
});

export type VoteEntryInput = z.infer<typeof VoteEntrySchema>;
export type GetEntriesQueryInput = z.infer<typeof GetEntriesQuerySchema>;
export type ScamFlagInput = z.infer<typeof ScamFlagSchema>;

