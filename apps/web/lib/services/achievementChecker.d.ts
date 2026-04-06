/**
 * Achievement Checker Service
 * Checks and unlocks achievements based on context
 * v0.36.9 - Achievements & Milestone System
 */
export interface AchievementContext {
    fightsWon?: number;
    totalWins?: number;
    damageThisFight?: number;
    damageDealt?: number;
    heroHp?: number;
    heroHpRemaining?: number;
    heroMaxHp?: number;
    heroLevel?: number;
    gold?: number;
    totalGoldEarned?: number;
    questCompleted?: boolean;
    streak?: number;
    hasBoughtSomething?: boolean;
    enemyTier?: string;
    enemyVariant?: string;
}
/**
 * Check and unlock achievements based on context
 * Returns list of newly unlocked achievements
 */
export declare function checkAndUnlockAchievements(userId: string, context: AchievementContext): Promise<string[]>;
