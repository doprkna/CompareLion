/**
 * Achievement Service
 * Handles achievement unlocking, rewards, and queries
 * v0.26.0 - Achievements Awakened
 */
export interface UnlockAchievementParams {
    userId: string;
    key: string;
    tier?: number;
}
export interface AchievementUnlockResult {
    unlocked: boolean;
    alreadyUnlocked: boolean;
    achievementId: string;
    xpReward: number;
    goldReward: number;
    tier: number;
}
/**
 * Unlock an achievement for a user (idempotent)
 * Awards XP and gold if newly unlocked
 */
export declare function unlockAchievement(userId: string, key: string, tier?: number): Promise<AchievementUnlockResult | null>;
/**
 * Get all achievements with user unlock status
 */
export declare function getUserAchievements(userId: string): Promise<any>;
/**
 * Get achievements grouped by category
 */
export declare function getAchievementsByCategory(userId: string): Promise<any>;
