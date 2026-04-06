/**
 * Photo Challenge Leaderboard Service
 * Weekly ranking of photo challenge entries
 * v0.37.14 - Snack Leaderboard
 */
export interface LeaderboardEntry {
    id: string;
    userId: string;
    imageUrl: string;
    category: string;
    createdAt: Date;
    totalScore: number;
    appealScore: number;
    creativityScore: number;
    finalScore: number;
    humanScore: number;
    aiScore: number;
    hasAiRating: boolean;
    rank: number;
    user?: {
        id: string;
        name: string | null;
        image: string | null;
    };
}
export interface UserRank {
    rank: number;
    total: number;
    entryId: string;
}
/**
 * Get weekly leaderboard for photo challenge entries
 *
 * @param category - Optional category filter
 * @param limit - Maximum number of entries to return (default: 20)
 * @returns Top entries sorted by total score (appeal + creativity)
 */
export declare function getWeeklyLeaderboard(category?: string, limit?: number): Promise<LeaderboardEntry[]>;
/**
 * Get user's rank in the weekly leaderboard
 *
 * @param userId - User ID
 * @param category - Optional category filter
 * @returns User's rank and total score, or null if no entry
 */
export declare function getUserRank(userId: string, category?: string): Promise<UserRank | null>;
