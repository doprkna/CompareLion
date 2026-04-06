/**
 * Prestige Scoring System
 *
 * Prestige represents capability, status, and accomplishment.
 * Range: 0 to 100 (capped for MVP)
 *
 * Formula: log10(level * achievements * 10 + 1)
 *
 * Factors:
 * - User level (higher = more prestige)
 * - Total achievements unlocked
 * - Total XP earned
 * - Duel victories
 * - Friend count
 */
/**
 * Calculate prestige score from user data
 * @param level User level
 * @param achievementCount Number of achievements
 * @param xp Total XP
 * @param duelWins Number of duel victories
 * @param friendCount Number of friends
 * @returns Calculated prestige score (0-100)
 */
export declare function calculatePrestige(level: number, achievementCount: number, xp?: number, duelWins?: number, friendCount?: number): number;
/**
 * Get prestige tier label
 * @param prestige Current prestige score
 * @returns Prestige tier description
 */
export declare function getPrestigeTier(prestige: number): {
    tier: string;
    label: string;
    color: string;
};
/**
 * Recalculate and update user's prestige score
 * @param userId User ID
 * @returns Updated prestige score
 */
export declare function recalculatePrestige(userId: string): Promise<number>;
/**
 * Set prestige score (admin override)
 * @param userId User ID
 * @param score New prestige score
 */
export declare function setPrestige(userId: string, score: number): Promise<void>;
