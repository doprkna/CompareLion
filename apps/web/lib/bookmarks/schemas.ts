/**
 * Bookmark Zod Schemas
 * Validation schemas for Bookmark API endpoints
 * v0.37.1 - Bookmark Question Feature
 */

import { z } from 'zod';

/**
 * Add Bookmark Schema
 */
export const AddBookmarkSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
});

/**
 * Remove Bookmark Schema
 */
export const RemoveBookmarkSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
});

/**
 * Type exports for TypeScript
 */
export type AddBookmarkInput = z.infer<typeof AddBookmarkSchema>;
export type RemoveBookmarkInput = z.infer<typeof RemoveBookmarkSchema>;

