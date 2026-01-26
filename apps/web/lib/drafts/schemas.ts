/**
 * Draft Review Queue Zod Schemas
 * Validation schemas for Draft Review Queue API endpoints
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

import { z } from 'zod';

/**
 * Create Draft Schema
 */
export const CreateDraftSchema = z.object({
  content: z.any(), // Flexible - JSON or string
});

/**
 * Boost Draft Schema
 */
export const BoostDraftSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
});

/**
 * Request Review Schema
 */
export const RequestReviewSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
});

/**
 * Approve Draft Schema
 */
export const ApproveDraftSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  comment: z.string().optional().nullable(),
});

/**
 * Reject Draft Schema
 */
export const RejectDraftSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  comment: z.string().optional().nullable(),
});

/**
 * Type exports for TypeScript
 */
export type CreateDraftInput = z.infer<typeof CreateDraftSchema>;
export type BoostDraftInput = z.infer<typeof BoostDraftSchema>;
export type RequestReviewInput = z.infer<typeof RequestReviewSchema>;
export type ApproveDraftInput = z.infer<typeof ApproveDraftSchema>;
export type RejectDraftInput = z.infer<typeof RejectDraftSchema>;

