/**
 * Bookmark Service
 * Add, remove, and retrieve question bookmarks
 * v0.37.1 - Bookmark Question Feature
 */
/**
 * Add a bookmark for a question
 *
 * @param userId - User ID
 * @param questionId - Question ID to bookmark
 * @returns Success result
 */
export declare function addBookmark(userId: string, questionId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Remove a bookmark for a question
 *
 * @param userId - User ID
 * @param questionId - Question ID to unbookmark
 * @returns Success result
 */
export declare function removeBookmark(userId: string, questionId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get all bookmarks for a user
 *
 * @param userId - User ID
 * @returns Array of bookmarks with question details
 */
export declare function getBookmarks(userId: string): Promise<any>;
/**
 * Check if a question is bookmarked by a user
 *
 * @param userId - User ID
 * @param questionId - Question ID
 * @returns True if bookmarked
 */
export declare function isBookmarked(userId: string, questionId: string): Promise<boolean>;
