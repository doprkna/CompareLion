/**
 * Streak System (v0.11.9)
 *
 * PLACEHOLDER: Daily login and activity streaks with rewards.
 */
/**
 * Update login streak
 */
export declare function updateLoginStreak(userId: string): Promise<null>;
/**
 * Update quiz streak
 */
export declare function updateQuizStreak(userId: string): Promise<null>;
/**
 * Update duel streak
 */
export declare function updateDuelStreak(userId: string): Promise<null>;
/**
 * Get user streak
 */
export declare function getUserStreak(userId: string): Promise<null>;
