/**
 * Economy Configuration
 * v0.18.0 - Season & Economy System
 */
export declare const ECONOMY_CONFIG: {
    readonly xpToCoinsRatio: 10;
    readonly rewards: {
        readonly questionAnswered: 1;
        readonly correctAnswer: 2;
        readonly dailyLogin: 5;
        readonly streakBonus: 3;
        readonly submissionApproved: 25;
        readonly eventParticipation: 10;
        readonly upvoteReceived: 1;
    };
    readonly season: {
        readonly durationDays: 90;
        readonly resetOnNewSeason: {
            readonly coins: true;
            readonly seasonalXP: true;
            readonly leaderboard: true;
            readonly cosmetics: false;
        };
        readonly archiveData: true;
    };
    readonly shop: {
        readonly refreshHours: 24;
        readonly featuredItemsCount: 3;
    };
    readonly cosmeticPricing: {
        readonly COMMON: {
            readonly min: 10;
            readonly max: 50;
        };
        readonly UNCOMMON: {
            readonly min: 50;
            readonly max: 100;
        };
        readonly RARE: {
            readonly min: 100;
            readonly max: 250;
        };
        readonly EPIC: {
            readonly min: 250;
            readonly max: 500;
        };
        readonly LEGENDARY: {
            readonly min: 500;
            readonly max: 1000;
        };
    };
    readonly leaderboard: {
        readonly topPlayersCount: 100;
        readonly updateIntervalMinutes: 5;
        readonly rewardTopPlayers: true;
        readonly seasonEndRewards: {
            readonly 1: {
                readonly xp: 500;
                readonly coins: 0;
                readonly diamondsBonus: 100;
            };
            readonly 2: {
                readonly xp: 300;
                readonly coins: 0;
                readonly diamondsBonus: 50;
            };
            readonly 3: {
                readonly xp: 200;
                readonly coins: 0;
                readonly diamondsBonus: 25;
            };
            readonly '4-10': {
                readonly xp: 100;
                readonly coins: 0;
                readonly diamondsBonus: 10;
            };
            readonly '11-50': {
                readonly xp: 50;
                readonly coins: 0;
                readonly diamondsBonus: 5;
            };
        };
    };
};
/**
 * Calculate coins from XP
 */
export declare function xpToCoins(xp: number): number;
/**
 * Calculate XP required for a certain number of coins
 */
export declare function coinsToXP(coins: number): number;
/**
 * Get coin reward for an action
 */
export declare function getCoinReward(action: keyof typeof ECONOMY_CONFIG.rewards): number;
/**
 * Get pricing range for a cosmetic rarity
 */
export declare function getPriceRange(rarity: keyof typeof ECONOMY_CONFIG.cosmeticPricing): {
    min: number;
    max: number;
};
/**
 * Check if user can afford an item
 */
export declare function canAfford(userCoins: number, itemPrice: number): boolean;
/**
 * Calculate season end reward for a rank
 */
export declare function getSeasonEndReward(rank: number): {
    xp: number;
    coins: number;
    diamondsBonus: number;
} | null;
