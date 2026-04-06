/**
 * Rating Session Service
 * Batch rating mode / "Tinder Mode" session flow
 * v0.38.17 - Batch Rating Mode
 */
export interface TasteProfile {
    metricsAvg: {
        [key: string]: number;
    };
    strongPoints: string[];
    weakPoints: string[];
    aiSummary: string;
}
/**
 * Start a new rating session
 * Creates session and selects items from source pool
 *
 * @param userId - User ID
 * @param category - Category or template ID
 * @param totalItems - Number of items to rate (5-20)
 * @returns Session ID
 */
export declare function startRatingSession(userId: string, category: string, totalItems: number): Promise<{
    sessionId: string;
}>;
/**
 * Get next unrated item in session
 * Returns item data or null if session is complete
 *
 * @param sessionId - Session ID
 * @param userId - User ID (for verification)
 * @returns Next item to rate or null
 */
export declare function getNextSessionItem(sessionId: string, userId: string): Promise<{
    sessionItemId: string;
    index: number;
    itemData: {
        imageUrl?: string;
        text?: string;
        category: string;
    } | null;
} | null>;
/**
 * Complete rating for a session item
 * Links RatingRequest to session item and increments counter
 *
 * @param sessionItemId - Session item ID
 * @param userId - User ID (for verification)
 * @param requestId - Rating request ID
 * @param skipped - Whether item was skipped
 * @returns Updated session state
 */
export declare function completeRatingForItem(sessionItemId: string, userId: string, requestId: string | null, skipped?: boolean): Promise<{
    success: boolean;
    sessionId: string;
    totalItemsRated: number;
    totalItemsPlanned: number;
}>;
/**
 * Finalize session and generate taste profile
 * Marks session as completed and computes taste profile
 *
 * @param sessionId - Session ID
 * @param userId - User ID (for verification)
 * @returns Taste profile
 */
export declare function finalizeSession(sessionId: string, userId: string): Promise<TasteProfile>;
/**
 * Get session summary (taste profile)
 *
 * @param sessionId - Session ID
 * @param userId - User ID (for verification)
 * @returns Taste profile
 */
export declare function getSessionSummary(sessionId: string, userId: string): Promise<TasteProfile>;
