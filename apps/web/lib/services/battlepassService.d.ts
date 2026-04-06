/**
 * BattlePass Service
 * v0.36.28 - BattlePass 2.0
 */
export interface BattlePassTier {
    level: number;
    freeRewardId?: string;
    premiumRewardId?: string;
    premium: boolean;
}
export interface BattlePassProgress {
    season: {
        id: string;
        name: string;
        seasonNumber: number;
        startsAt: Date;
        endsAt: Date;
        premiumPrice: number | null;
    };
    tiers: BattlePassTier[];
    userProgress: {
        xp: number;
        currentTier: number;
        premiumActive: boolean;
        claimedTiers: number[];
        unlockedTiers: number[];
    };
}
/**
 * Calculate XP required for a tier
 * Formula: tierXP = 100 * tierNumber
 */
export declare function getTierXP(tier: number): number;
/**
 * Get current active battlepass season
 */
export declare function getCurrentBattlePassSeason(): Promise<any>;
/**
 * Get or create user battlepass progress
 */
export declare function getUserBattlePassProgress(userId: string, seasonId: string): Promise<any>;
/**
 * Get full battlepass progress for user
 */
export declare function getBattlePassProgress(userId: string): Promise<BattlePassProgress | null>;
/**
 * Add XP to battlepass
 * Returns updated level and any newly unlocked tiers
 */
export declare function addBattlePassXP(userId: string, xpAmount: number): Promise<{
    success: boolean;
    newTier?: number;
    unlockedTiers: number[];
    error?: string;
}>;
/**
 * Claim a tier reward
 */
export declare function claimBattlePassReward(userId: string, tier: number, track: 'free' | 'premium'): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Activate premium battlepass
 */
export declare function activatePremiumBattlePass(userId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Claim all available rewards
 */
export declare function claimAllAvailableRewards(userId: string): Promise<{
    success: boolean;
    claimed: number;
    errors: string[];
}>;
