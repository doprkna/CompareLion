/**
 * @deprecated This file is deprecated as of v0.42.24.
 * All constants have been migrated to the unified config system.
 *
 * Use the unified config instead:
 * ```typescript
 * import { config } from '@parel/core/config';
 * // Instead of XP_CONSTANTS.LEVEL_MULTIPLIER
 * const multiplier = config.gameplay.xp.levelMultiplier;
 * ```
 *
 * This file is kept for backward compatibility only.
 * It will be removed in a future version.
 *
 * Game System Constants
 * Centralized configuration for XP, currency, scoring, and game mechanics
 */
export declare const XP_CONSTANTS: {
    /** XP multiplier for level formula */
    readonly LEVEL_MULTIPLIER: 100;
    /** Base XP for completing a question */
    readonly QUESTION_BASE: 10;
    /** XP per difficulty level */
    readonly DIFFICULTY: {
        readonly easy: 1;
        readonly medium: 2;
        readonly hard: 3;
    };
    /** Streak bonus multipliers */
    readonly STREAK_BONUS: {
        readonly 5: 1.1;
        readonly 10: 1.2;
        readonly 20: 1.5;
        readonly 50: 2;
    };
};
export declare const CURRENCY_CONSTANTS: {
    /** Starting funds for new users */
    readonly STARTING_FUNDS: 1000;
    /** Starting diamonds for new users */
    readonly STARTING_DIAMONDS: 0;
    /** Currency names */
    readonly NAMES: {
        readonly funds: "Funds";
        readonly diamonds: "Diamonds";
    };
    /** Currency symbols */
    readonly SYMBOLS: {
        readonly funds: "💰";
        readonly diamonds: "💎";
    };
    /** Exchange rates */
    readonly EXCHANGE_RATE: {
        readonly fundsPerDiamond: 100;
        readonly diamondPerFunds: 0.01;
    };
};
export declare const SCORE_CONSTANTS: {
    /** Difficulty score mapping (for leaderboards) */
    readonly DIFFICULTY_SCORE: {
        readonly easy: 1;
        readonly medium: 2;
        readonly hard: 3;
    };
    /** Action scores */
    readonly ACTIONS: {
        readonly questionAnswered: 1;
        readonly questionSkipped: 0;
        readonly achievementUnlocked: 10;
        readonly challengeCompleted: 5;
        readonly duelWon: 3;
        readonly duelLost: -1;
    };
};
export declare const KARMA_CONSTANTS: {
    /** Karma thresholds for tiers */
    readonly TIERS: {
        readonly saint: 100;
        readonly virtuous: 50;
        readonly good: 20;
        readonly neutral_good: 5;
        readonly neutral: 0;
        readonly neutral_bad: -5;
        readonly chaotic: -20;
        readonly villain: -50;
    };
    /** Karma rewards/penalties */
    readonly ACTIONS: {
        readonly challengeAccepted: 1;
        readonly challengeDeclined: -1;
        readonly socialHelped: 2;
        readonly socialResponded: 1;
        readonly socialReacted: 0.5;
        readonly socialIgnored: -0.5;
        readonly socialReported: -2;
    };
    /** Karma caps per action */
    readonly CAPS: {
        readonly perAnswer: {
            readonly min: -5;
            readonly max: 5;
        };
        readonly total: {
            readonly min: -1000;
            readonly max: 1000;
        };
    };
};
export declare const PRESTIGE_CONSTANTS: {
    /** Maximum prestige score */
    readonly CAP: 100;
    /** Prestige tier thresholds */
    readonly TIERS: {
        readonly legendary: 90;
        readonly renowned: 75;
        readonly distinguished: 60;
        readonly respected: 40;
        readonly known: 20;
        readonly emerging: 5;
        readonly novice: 0;
    };
    /** Prestige bonuses */
    readonly BONUSES: {
        readonly xpMultiplier: 2;
        readonly duelWinMultiplier: 0.5;
        readonly friendMultiplier: 0.2;
        readonly friendCap: 5;
    };
};
export declare const COLOR_CONSTANTS: {
    /** Karma tier colors */
    readonly KARMA: {
        readonly saint: "text-blue-400";
        readonly virtuous: "text-green-400";
        readonly good: "text-green-300";
        readonly neutral_good: "text-gray-300";
        readonly neutral: "text-gray-400";
        readonly neutral_bad: "text-gray-500";
        readonly chaotic: "text-red-300";
        readonly villain: "text-red-500";
    };
    /** Prestige tier colors */
    readonly PRESTIGE: {
        readonly legendary: "text-yellow-400";
        readonly renowned: "text-purple-400";
        readonly distinguished: "text-blue-400";
        readonly respected: "text-green-400";
        readonly known: "text-gray-300";
        readonly emerging: "text-gray-400";
        readonly novice: "text-gray-500";
    };
    /** Difficulty colors */
    readonly DIFFICULTY: {
        readonly easy: "text-green-500";
        readonly medium: "text-yellow-500";
        readonly hard: "text-red-500";
    };
    /** Status colors */
    readonly STATUS: {
        readonly success: "text-green-500";
        readonly warning: "text-yellow-500";
        readonly error: "text-red-500";
        readonly info: "text-blue-500";
    };
};
export declare const LIMITS_CONSTANTS: {
    /** Question limits */
    readonly QUESTIONS: {
        readonly maxPerDay: 100;
        readonly maxSkipPerDay: 20;
        readonly timeoutSeconds: 300;
    };
    /** Social limits */
    readonly SOCIAL: {
        readonly maxFriends: 100;
        readonly maxFriendRequests: 50;
        readonly maxClanSize: 50;
    };
    /** Content limits */
    readonly CONTENT: {
        readonly maxAnswerLength: 5000;
        readonly minAnswerLength: 1;
        readonly maxBioLength: 500;
        readonly maxUsernameLength: 30;
    };
};
export declare const TIMING_CONSTANTS: {
    /** Debounce/throttle timings (ms) */
    readonly DEBOUNCE: {
        readonly search: 300;
        readonly input: 500;
        readonly save: 1000;
    };
    /** Animation durations (ms) */
    readonly ANIMATION: {
        readonly fast: 150;
        readonly normal: 300;
        readonly slow: 500;
        readonly xpGain: 1000;
    };
    /** Polling intervals (ms) */
    readonly POLLING: {
        readonly presence: 30000;
        readonly notifications: 60000;
        readonly leaderboard: 300000;
    };
};
export declare const ACHIEVEMENT_CONSTANTS: {
    /** Achievement point values */
    readonly POINTS: {
        readonly bronze: 10;
        readonly silver: 25;
        readonly gold: 50;
        readonly platinum: 100;
        readonly diamond: 250;
    };
    /** Achievement rarity */
    readonly RARITY: {
        readonly common: 1;
        readonly uncommon: 0.5;
        readonly rare: 0.1;
        readonly epic: 0.01;
        readonly legendary: 0.001;
    };
};
export declare const DEFAULTS: {
    readonly user: {
        readonly level: 1;
        readonly xp: 0;
        readonly funds: 1000;
        readonly diamonds: 0;
        readonly karmaScore: 0;
        readonly prestigeScore: 0;
        readonly questionsAnswered: 0;
        readonly score: 0;
        readonly streak: 0;
    };
    readonly pagination: {
        readonly pageSize: 20;
        readonly maxPageSize: 100;
    };
};
export declare const ECONOMY_CONSTANTS: {
    /** XP to Coins conversion ratio */
    readonly XP_TO_COINS_RATIO: 10;
    /** Coin rewards per action */
    readonly REWARDS: {
        readonly questionAnswered: 1;
        readonly correctAnswer: 2;
        readonly dailyLogin: 5;
        readonly streakBonus: 3;
        readonly submissionApproved: 25;
        readonly eventParticipation: 10;
        readonly upvoteReceived: 1;
    };
    /** Season settings */
    readonly SEASON: {
        readonly durationDays: 90;
        readonly resetOnNewSeason: {
            readonly coins: true;
            readonly seasonalXP: true;
            readonly leaderboard: true;
            readonly cosmetics: false;
        };
        readonly archiveData: true;
    };
    /** Shop settings */
    readonly SHOP: {
        readonly refreshHours: 24;
        readonly featuredItemsCount: 3;
    };
    /** Cosmetic pricing by rarity */
    readonly COSMETIC_PRICING: {
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
    /** Leaderboard settings */
    readonly LEADERBOARD: {
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
export declare const REWARD_CONSTANTS: {
    /** Base rewards per action type */
    readonly BASE: {
        readonly xp: 10;
        readonly gold: 2;
    };
    readonly KILL: {
        readonly xp: 50;
        readonly gold: 10;
    };
    readonly BOSS: {
        readonly xp: 200;
        readonly gold: 60;
    };
    readonly REFLECTION: {
        readonly xp: 25;
        readonly gold: 5;
    };
    readonly QUIZ: {
        readonly xp: 20;
        readonly gold: 5;
    };
    readonly ACHIEVEMENT: {
        readonly xp: 100;
        readonly gold: 0;
    };
    /** Streak multipliers */
    readonly STREAK_MULTIPLIER: {
        readonly perKill: 0.05;
        readonly max: 2;
    };
    /** Difficulty multipliers */
    readonly DIFFICULTY_MULTIPLIER: {
        readonly easy: 0.8;
        readonly normal: 1;
        readonly hard: 1.2;
        readonly boss: 2.5;
    };
    /** Power scaling (from equipped items) */
    readonly POWER_SCALING: {
        readonly base: 1;
        readonly perPower: 0.01;
        readonly cap: 1.5;
    };
    /** Safety caps (prevent overflow) */
    readonly CAPS: {
        readonly maxXp: 1000000;
        readonly maxGold: 100000;
    };
    /** Item drop rates */
    readonly DROPS: {
        readonly rare: 0.05;
        readonly epic: 0.02;
        readonly legendary: 0.005;
        readonly alpha: 0.001;
    };
};
/**
 * @deprecated Use config.gameplay.economy.xpToCoinsRatio instead
 * Calculate coins from XP
 */
export declare function xpToCoins(xp: number): number;
/**
 * @deprecated Use config.gameplay.economy.xpToCoinsRatio instead
 * Calculate XP required for coins
 */
export declare function coinsToXP(coins: number): number;
/**
 * @deprecated Use config.gameplay.economy.rewards instead
 * Get coin reward for an action
 */
export declare function getCoinReward(action: keyof typeof ECONOMY_CONSTANTS.REWARDS): number;
/**
 * @deprecated Use config.gameplay.economy.cosmeticPricing instead
 * Get pricing range for a cosmetic rarity
 */
export declare function getPriceRange(rarity: keyof typeof ECONOMY_CONSTANTS.COSMETIC_PRICING): {
    min: number;
    max: number;
};
/**
 * @deprecated Use config.gameplay.leaderboard.seasonEndRewards instead
 * Get season end reward for a rank
 */
export declare function getSeasonEndReward(rank: number): {
    xp: number;
    coins: number;
    diamondsBonus: number;
} | null;
export type DifficultyLevel = keyof typeof XP_CONSTANTS.DIFFICULTY;
export type CurrencyType = keyof typeof CURRENCY_CONSTANTS.SYMBOLS;
export type KarmaTier = keyof typeof KARMA_CONSTANTS.TIERS;
export type PrestigeTier = keyof typeof PRESTIGE_CONSTANTS.TIERS;
