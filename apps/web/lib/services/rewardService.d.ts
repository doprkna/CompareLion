/**
 * Reward Service
 * Centralized reward calculation logic with multipliers and scaling
 * v0.26.1 - Reward Economy & Scaling Pass
 */
import { RewardConfig, DifficultyLevel } from '@parel/core/config';
export interface RewardCalculationOptions {
    streak?: number;
    power?: number;
    difficulty?: DifficultyLevel;
    applyStreakMultiplier?: boolean;
    applyPowerScaling?: boolean;
}
export interface RewardResult {
    xp: number;
    gold: number;
    multiplier: number;
    breakdown: {
        baseXp: number;
        baseGold: number;
        streakMult: number;
        diffMult: number;
        powerMult: number;
        finalXp: number;
        finalGold: number;
    };
}
/**
 * Calculate reward with all multipliers applied
 * @param baseXp Base XP before multipliers
 * @param baseGold Base gold before multipliers
 * @param options Multiplier options
 */
export declare function calculateReward(baseXp: number, baseGold: number, options?: RewardCalculationOptions): RewardResult;
/**
 * Helper to get base reward for a reward type
 */
export declare function getBaseReward(type: keyof typeof RewardConfig): {
    xp: number;
    gold: number;
};
/**
 * Calculate combat kill reward
 */
export declare function calculateCombatKillReward(streak: number, power?: number, isBoss?: boolean): RewardResult;
/**
 * Calculate reflection reward
 */
export declare function calculateReflectionReward(): RewardResult;
/**
 * Calculate quiz reward
 */
export declare function calculateQuizReward(difficulty?: DifficultyLevel): RewardResult;
/**
 * Calculate achievement reward (no multipliers)
 */
export declare function calculateAchievementReward(xpReward: number, goldReward: number): RewardResult;
