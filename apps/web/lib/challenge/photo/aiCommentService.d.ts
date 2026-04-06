/**
 * Photo Challenge AI Comment Service
 * Generate fun AI commentary for photo entries (stub)
 * v0.37.12 - Photo Challenge
 */
/**
 * Generate AI comment for a photo entry
 * Stub implementation - returns simple placeholder for now
 *
 * @param entryId - Entry ID
 * @returns AI-generated comment text
 */
export declare function aiCommentForEntry(entryId: string): Promise<string>;
/**
 * Get cached AI comment or generate new one
 *
 * @param entryId - Entry ID
 * @returns AI comment text
 */
export declare function getAIComment(entryId: string): Promise<string>;
