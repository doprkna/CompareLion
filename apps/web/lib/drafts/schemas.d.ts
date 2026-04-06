/**
 * Draft Review Queue Zod Schemas
 * Validation schemas for Draft Review Queue API endpoints
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */
import { z } from 'zod';
/**
 * Create Draft Schema
 */
export declare const CreateDraftSchema: z.ZodObject<{
    content: z.ZodAny;
}, z.core.$strip>;
/**
 * Boost Draft Schema
 */
export declare const BoostDraftSchema: z.ZodObject<{
    draftId: z.ZodString;
}, z.core.$strip>;
/**
 * Request Review Schema
 */
export declare const RequestReviewSchema: z.ZodObject<{
    draftId: z.ZodString;
}, z.core.$strip>;
/**
 * Approve Draft Schema
 */
export declare const ApproveDraftSchema: z.ZodObject<{
    draftId: z.ZodString;
    comment: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Reject Draft Schema
 */
export declare const RejectDraftSchema: z.ZodObject<{
    draftId: z.ZodString;
    comment: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Type exports for TypeScript
 */
export type CreateDraftInput = z.infer<typeof CreateDraftSchema>;
export type BoostDraftInput = z.infer<typeof BoostDraftSchema>;
export type RequestReviewInput = z.infer<typeof RequestReviewSchema>;
export type ApproveDraftInput = z.infer<typeof ApproveDraftSchema>;
export type RejectDraftInput = z.infer<typeof RejectDraftSchema>;
