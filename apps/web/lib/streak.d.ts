/**
 * Daily Streak Tracking
 * Manages user streaks based on daily activity
 * v0.13.2m - Retention Features
 */
export interface StreakData {
    currentStreak: number;
    lastAnswerDate: string;
    longestStreak: number;
    totalDaysActive: number;
}
/**
 * Get current streak data from localStorage
 */
export declare function getStreakData(): StreakData;
/**
 * Update streak based on new activity
 * Returns { streak, isNewStreak, wasBroken }
 */
export declare function updateStreak(): {
    streak: StreakData;
    isNewStreak: boolean;
    wasBroken: boolean;
    isFirstDay: boolean;
};
/**
 * Save streak data to localStorage
 */
export declare function saveStreakData(streak: StreakData): void;
/**
 * Reset streak (for testing or user request)
 */
export declare function resetStreak(): void;
/**
 * Get streak emoji based on streak count
 */
export declare function getStreakEmoji(streak: number): string;
/**
 * Get streak message
 */
export declare function getStreakMessage(streak: number, isNewStreak: boolean, wasBroken: boolean): string;
/**
 * Check if user has answered today
 */
export declare function hasAnsweredToday(): boolean;
/**
 * Get days until streak expires (within grace period)
 */
export declare function getDaysUntilExpiry(): number;
