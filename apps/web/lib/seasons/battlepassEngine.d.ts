/**
 * Battlepass Engine
 * XP calculation, level progression, unlock logic
 * v0.36.38 - Seasons & Battlepass 1.0
 */
import { UserBattlepassProgress, BattlepassProgress, BattlepassTrack } from './types';
/**
 * Get or create user battlepass progress
 */
export declare function getUserBattlepassProgress(userId: string, seasonId: string): Promise<UserBattlepassProgress | null>;
/**
 * Add XP to user's battlepass
 * Returns updated level and newly unlocked tiers
 */
export declare function addBattlepassXP(userId: string, xpAmount: number): Promise<{
    success: boolean;
    newLevel?: number;
    unlockedLevels: number[];
    error?: string;
}>;
/**
 * Check if user can claim a tier reward
 */
export declare function canClaimReward(userId: string, seasonId: string, tier: number, track: BattlepassTrack): Promise<{
    canClaim: boolean;
    error?: string;
}>;
/**
 * Get full battlepass progress for user
 */
export declare function getBattlepassProgress(userId: string): Promise<BattlepassProgress | null>;
