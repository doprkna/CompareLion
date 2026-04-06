/**
 * Season Pass Service
 * v0.36.23 - Season Pass System
 */
export interface SeasonProgress {
    season: {
        id: string;
        name: string;
        seasonNumber: number;
        startsAt: Date;
        endsAt: Date;
        isActive: boolean;
    };
    tiers: Array<{
        id: string;
        tier: number;
        xpRequired: number;
        freeReward: any;
        premiumReward: any;
    }>;
    userProgress: {
        xp: number;
        currentTier: number;
        claimedFreeRewards: number[];
        claimedPremiumRewards: number[];
    };
}
/**
 * Get current active season
 */
export declare function getCurrentSeason(): Promise<any | null>;
/**
 * Get user's progress for a season
 */
export declare function getUserSeasonProgress(userId: string, seasonId: string): Promise<any | null>;
/**
 * Add XP to user's season progress
 * Called after combat/fights
 */
export declare function addSeasonXP(userId: string, xpAmount: number): Promise<{
    tieredUp: boolean;
    newTier?: number;
}>;
/**
 * Claim a season reward
 */
export declare function claimSeasonReward(userId: string, seasonId: string, tier: number, track: 'free' | 'premium'): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get full season progress for user
 */
export declare function getSeasonProgress(userId: string): Promise<SeasonProgress | null>;
