/**
 * Photo Challenge Zod Schemas
 * Validation schemas for Photo Challenge API endpoints
 * v0.37.12 - Photo Challenge
 */
import { z } from 'zod';
/**
 * Vote on Entry Schema
 */
export declare const VoteEntrySchema: z.ZodObject<{
    entryId: z.ZodString;
    voteType: z.ZodEnum<{
        creativity: "creativity";
        appeal: "appeal";
    }>;
}, z.core.$strip>;
/**
 * Get Entries Query Schema
 */
export declare const GetEntriesQuerySchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Scam Flag Schema
 */
export declare const ScamFlagSchema: z.ZodObject<{
    entryId: z.ZodString;
    reason: z.ZodEnum<{
        other: "other";
        meme: "meme";
        ai: "ai";
        watermark: "watermark";
        stock: "stock";
    }>;
}, z.core.$strip>;
export type VoteEntryInput = z.infer<typeof VoteEntrySchema>;
export type GetEntriesQueryInput = z.infer<typeof GetEntriesQuerySchema>;
export type ScamFlagInput = z.infer<typeof ScamFlagSchema>;
