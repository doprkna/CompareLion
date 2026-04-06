/**
 * Streak Tracker Utility
 * v0.34.2 - Tracks user activity streaks (7-day window)
 */
export interface StreakData {
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
    streakBonus: number;
}
/**
 * Get user's current streak data
 */
export declare function getUserStreak(userId: string): Promise<StreakData>;
/**
 * Update user's streak (call this when user completes an activity)
 */
export declare function updateUserStreak(userId: string): Promise<StreakData>;
/**
 * Get streak bonus multiplier for a user
 */
export declare function getStreakMultiplier(userId: string): Promise<number>;
/**
 * Reset streaks for inactive users (cron job)
 * This is a no-op since streaks are calculated on-demand
 */
export declare function resetInactiveStreaks(): Promise<void>;
/**
 * Get leaderboard of users by current streak
 */
export declare function getStreakLeaderboard(limit?: number): Promise<StreakData[]>;
