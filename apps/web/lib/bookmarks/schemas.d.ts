/**
 * Bookmark Zod Schemas
 * Validation schemas for Bookmark API endpoints
 * v0.37.1 - Bookmark Question Feature
 */
import { z } from 'zod';
/**
 * Add Bookmark Schema
 */
export declare const AddBookmarkSchema: z.ZodObject<{
    questionId: z.ZodString;
}, z.core.$strip>;
/**
 * Remove Bookmark Schema
 */
export declare const RemoveBookmarkSchema: z.ZodObject<{
    questionId: z.ZodString;
}, z.core.$strip>;
/**
 * Type exports for TypeScript
 */
export type AddBookmarkInput = z.infer<typeof AddBookmarkSchema>;
export type RemoveBookmarkInput = z.infer<typeof RemoveBookmarkSchema>;
