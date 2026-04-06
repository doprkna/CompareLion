/**
 * User Scores Update Utility
 *
 * Centralized function to recalculate both karma and prestige.
 * Called after significant user actions.
 */
/**
 * Recalculate and update all user scores
 * @param userId User ID
 * @returns Object with updated karma and prestige scores
 */
export declare function updateUserScores(userId: string): Promise<{
    karma: number;
    prestige: number;
}>;
/**
 * Batch update scores for multiple users
 * @param userIds Array of user IDs
 */
export declare function batchUpdateScores(userIds: string[]): Promise<void>;
