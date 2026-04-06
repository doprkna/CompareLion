/**
 * Seasons & Battlepass Types & Enums
 * Shared types, enums, and interfaces for Seasons & Battlepass system
 * v0.36.38 - Seasons & Battlepass 1.0
 */
/**
 * Battlepass Track Type
 */
export declare enum BattlepassTrack {
    FREE = "free",
    PREMIUM = "premium"
}
/**
 * Reward Type - What kind of reward is granted
 */
export declare enum RewardType {
    GOLD = "gold",
    DIAMONDS = "diamonds",
    XP = "xp",
    ITEM = "item",
    COMPANION = "companion",
    THEME = "theme",
    XP_BOOST = "xp-boost",
    COSMETIC = "cosmetic",
    PERK = "perk"
}
/**
 * Battlepass reward structure
 */
export interface BattlepassReward {
    type: RewardType;
    amount?: number;
    itemId?: string;
    companionId?: string;
    themeId?: string;
    cosmeticId?: string;
    perkId?: string;
    quantity?: number;
    name?: string;
    description?: string;
    icon?: string;
}
/**
 * Battlepass tier definition
 */
export interface BattlepassTier {
    level: number;
    xpRequired: number;
    freeReward?: BattlepassReward | null;
    premiumReward?: BattlepassReward | null;
}
/**
 * Season definition
 */
export interface Season {
    id: string;
    name: string;
    seasonNumber: number;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
    premiumPrice?: number | null;
    description?: string | null;
    theme?: string | null;
}
/**
 * User battlepass progress
 */
export interface UserBattlepassProgress {
    id: string;
    userId: string;
    seasonId: string;
    xp: number;
    currentLevel: number;
    premiumActive: boolean;
    claimedRewards: number[];
    unlockedLevels: number[];
}
/**
 * Full battlepass progress (for API responses)
 */
export interface BattlepassProgress {
    season: Season;
    tiers: BattlepassTier[];
    userProgress: {
        xp: number;
        currentLevel: number;
        premiumActive: boolean;
        claimedRewards: number[];
        unlockedLevels: number[];
        progressToNextLevel?: {
            currentXP: number;
            requiredXP: number;
            percent: number;
        };
    };
}
/**
 * Season summary (for rollover)
 */
export interface SeasonSummary {
    seasonId: string;
    seasonNumber: number;
    totalUsers: number;
    totalXP: number;
    averageLevel: number;
    maxLevel: number;
    premiumUsers: number;
    totalRewardsClaimed: number;
}
/**
 * Calculate XP required for a level
 * Simple formula: level * baseXP
 *
 * @param level - Target level
 * @param baseXP - Base XP per level (default: 100)
 */
export declare function calculateLevelXP(level: number, baseXP?: number): number;
/**
 * Calculate level from total XP
 *
 * @param totalXP - Total XP accumulated
 * @param baseXP - Base XP per level (default: 100)
 */
export declare function calculateLevelFromXP(totalXP: number, baseXP?: number): number;
/**
 * Calculate progress to next level
 *
 * @param currentXP - Current total XP
 * @param baseXP - Base XP per level (default: 100)
 */
export declare function calculateProgressToNextLevel(currentXP: number, baseXP?: number): {
    currentXP: number;
    requiredXP: number;
    percent: number;
};
/**
 * Check if season is active
 */
export declare function isSeasonActive(season: Season): boolean;
/**
 * Get days remaining in season
 */
export declare function getDaysRemaining(season: Season): number;
/**
 * Validate reward type
 */
export declare function isValidRewardType(value: string): value is RewardType;
/**
 * Get reward type display name
 */
export declare function getRewardTypeDisplayName(type: RewardType): string;
