/**
 * Game System Constants
 * Centralized configuration for XP, currency, scoring, and game mechanics
 */

// ========== XP CONSTANTS ==========
export const XP_CONSTANTS = {
  /** XP multiplier for level formula */
  LEVEL_MULTIPLIER: 100,
  
  /** Base XP for completing a question */
  QUESTION_BASE: 10,
  
  /** XP per difficulty level */
  DIFFICULTY: {
    easy: 1,
    medium: 2,
    hard: 3,
  },
  
  /** Streak bonus multipliers */
  STREAK_BONUS: {
    5: 1.1,   // 10% bonus at 5 streak
    10: 1.2,  // 20% bonus at 10 streak
    20: 1.5,  // 50% bonus at 20 streak
    50: 2.0,  // 100% bonus at 50 streak
  },
} as const;

// ========== CURRENCY CONSTANTS ==========
export const CURRENCY_CONSTANTS = {
  /** Starting funds for new users */
  STARTING_FUNDS: 1000,
  
  /** Starting diamonds for new users */
  STARTING_DIAMONDS: 0,
  
  /** Currency names */
  NAMES: {
    funds: 'Funds',
    diamonds: 'Diamonds',
  },
  
  /** Currency symbols */
  SYMBOLS: {
    funds: '💰',
    diamonds: '💎',
  },
  
  /** Exchange rates */
  EXCHANGE_RATE: {
    fundsPerDiamond: 100,
    diamondPerFunds: 0.01,
  },
} as const;

// ========== SCORING CONSTANTS ==========
export const SCORE_CONSTANTS = {
  /** Difficulty score mapping (for leaderboards) */
  DIFFICULTY_SCORE: {
    easy: 1,
    medium: 2,
    hard: 3,
  },
  
  /** Action scores */
  ACTIONS: {
    questionAnswered: 1,
    questionSkipped: 0,
    achievementUnlocked: 10,
    challengeCompleted: 5,
    duelWon: 3,
    duelLost: -1,
  },
} as const;

// ========== KARMA CONSTANTS ==========
export const KARMA_CONSTANTS = {
  /** Karma thresholds for tiers */
  TIERS: {
    saint: 100,
    virtuous: 50,
    good: 20,
    neutral_good: 5,
    neutral: 0,
    neutral_bad: -5,
    chaotic: -20,
    villain: -50,
  },
  
  /** Karma rewards/penalties */
  ACTIONS: {
    challengeAccepted: 1,
    challengeDeclined: -1,
    socialHelped: 2,
    socialResponded: 1,
    socialReacted: 0.5,
    socialIgnored: -0.5,
    socialReported: -2,
  },
  
  /** Karma caps per action */
  CAPS: {
    perAnswer: { min: -5, max: 5 },
    total: { min: -1000, max: 1000 },
  },
} as const;

// ========== PRESTIGE CONSTANTS ==========
export const PRESTIGE_CONSTANTS = {
  /** Maximum prestige score */
  CAP: 100,
  
  /** Prestige tier thresholds */
  TIERS: {
    legendary: 90,
    renowned: 75,
    distinguished: 60,
    respected: 40,
    known: 20,
    emerging: 5,
    novice: 0,
  },
  
  /** Prestige bonuses */
  BONUSES: {
    xpMultiplier: 2,
    duelWinMultiplier: 0.5,
    friendMultiplier: 0.2,
    friendCap: 5,
  },
} as const;

// ========== COLOR CONSTANTS ==========
export const COLOR_CONSTANTS = {
  /** Karma tier colors */
  KARMA: {
    saint: 'text-blue-400',
    virtuous: 'text-green-400',
    good: 'text-green-300',
    neutral_good: 'text-gray-300',
    neutral: 'text-gray-400',
    neutral_bad: 'text-gray-500',
    chaotic: 'text-red-300',
    villain: 'text-red-500',
  },
  
  /** Prestige tier colors */
  PRESTIGE: {
    legendary: 'text-yellow-400',
    renowned: 'text-purple-400',
    distinguished: 'text-blue-400',
    respected: 'text-green-400',
    known: 'text-gray-300',
    emerging: 'text-gray-400',
    novice: 'text-gray-500',
  },
  
  /** Difficulty colors */
  DIFFICULTY: {
    easy: 'text-green-500',
    medium: 'text-yellow-500',
    hard: 'text-red-500',
  },
  
  /** Status colors */
  STATUS: {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  },
} as const;

// ========== LIMITS CONSTANTS ==========
export const LIMITS_CONSTANTS = {
  /** Question limits */
  QUESTIONS: {
    maxPerDay: 100,
    maxSkipPerDay: 20,
    timeoutSeconds: 300,
  },
  
  /** Social limits */
  SOCIAL: {
    maxFriends: 100,
    maxFriendRequests: 50,
    maxClanSize: 50,
  },
  
  /** Content limits */
  CONTENT: {
    maxAnswerLength: 5000,
    minAnswerLength: 1,
    maxBioLength: 500,
    maxUsernameLength: 30,
  },
} as const;

// ========== TIMING CONSTANTS ==========
export const TIMING_CONSTANTS = {
  /** Debounce/throttle timings (ms) */
  DEBOUNCE: {
    search: 300,
    input: 500,
    save: 1000,
  },
  
  /** Animation durations (ms) */
  ANIMATION: {
    fast: 150,
    normal: 300,
    slow: 500,
    xpGain: 1000,
  },
  
  /** Polling intervals (ms) */
  POLLING: {
    presence: 30000,      // 30s
    notifications: 60000,  // 1m
    leaderboard: 300000,   // 5m
  },
} as const;

// ========== ACHIEVEMENT CONSTANTS ==========
export const ACHIEVEMENT_CONSTANTS = {
  /** Achievement point values */
  POINTS: {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100,
    diamond: 250,
  },
  
  /** Achievement rarity */
  RARITY: {
    common: 1.0,
    uncommon: 0.5,
    rare: 0.1,
    epic: 0.01,
    legendary: 0.001,
  },
} as const;

// ========== DEFAULT VALUES ==========
export const DEFAULTS = {
  user: {
    level: 1,
    xp: 0,
    funds: CURRENCY_CONSTANTS.STARTING_FUNDS,
    diamonds: CURRENCY_CONSTANTS.STARTING_DIAMONDS,
    karmaScore: 0,
    prestigeScore: 0,
    questionsAnswered: 0,
    score: 0,
    streak: 0,
  },
  pagination: {
    pageSize: 20,
    maxPageSize: 100,
  },
} as const;

// ========== ECONOMY CONSTANTS ==========
// Merged from config/economy.ts
export const ECONOMY_CONSTANTS = {
  /** XP to Coins conversion ratio */
  XP_TO_COINS_RATIO: 10, // 10 XP = 1 coin
  
  /** Coin rewards per action */
  REWARDS: {
    questionAnswered: 1,
    correctAnswer: 2,
    dailyLogin: 5,
    streakBonus: 3,
    submissionApproved: 25,
    eventParticipation: 10,
    upvoteReceived: 1,
  },
  
  /** Season settings */
  SEASON: {
    durationDays: 90,
    resetOnNewSeason: {
      coins: true,
      seasonalXP: true,
      leaderboard: true,
      cosmetics: false,
    },
    archiveData: true,
  },
  
  /** Shop settings */
  SHOP: {
    refreshHours: 24,
    featuredItemsCount: 3,
  },
  
  /** Cosmetic pricing by rarity */
  COSMETIC_PRICING: {
    COMMON: { min: 10, max: 50 },
    UNCOMMON: { min: 50, max: 100 },
    RARE: { min: 100, max: 250 },
    EPIC: { min: 250, max: 500 },
    LEGENDARY: { min: 500, max: 1000 },
  },
  
  /** Leaderboard settings */
  LEADERBOARD: {
    topPlayersCount: 100,
    updateIntervalMinutes: 5,
    rewardTopPlayers: true,
    seasonEndRewards: {
      1: { xp: 500, coins: 0, diamondsBonus: 100 },
      2: { xp: 300, coins: 0, diamondsBonus: 50 },
      3: { xp: 200, coins: 0, diamondsBonus: 25 },
      '4-10': { xp: 100, coins: 0, diamondsBonus: 10 },
      '11-50': { xp: 50, coins: 0, diamondsBonus: 5 },
    },
  },
} as const;

// ========== REWARD CONSTANTS ==========
// Merged from lib/config/rewardConfig.ts
export const REWARD_CONSTANTS = {
  /** Base rewards per action type */
  BASE: { xp: 10, gold: 2 },
  KILL: { xp: 50, gold: 10 },
  BOSS: { xp: 200, gold: 60 },
  REFLECTION: { xp: 25, gold: 5 },
  QUIZ: { xp: 20, gold: 5 },
  ACHIEVEMENT: { xp: 100, gold: 0 },
  
  /** Streak multipliers */
  STREAK_MULTIPLIER: {
    perKill: 0.05, // 5% bonus per streak kill
    max: 2.0,      // Cap at 2x (100% bonus)
  },
  
  /** Difficulty multipliers */
  DIFFICULTY_MULTIPLIER: {
    easy: 0.8,
    normal: 1.0,
    hard: 1.2,
    boss: 2.5,
  },
  
  /** Power scaling (from equipped items) */
  POWER_SCALING: {
    base: 1.0,
    perPower: 0.01, // 1% per power point
    cap: 1.5,       // Cap at 50% bonus
  },
  
  /** Safety caps (prevent overflow) */
  CAPS: {
    maxXp: 1000000,
    maxGold: 100000,
  },
  
  /** Item drop rates */
  DROPS: {
    rare: 0.05,
    epic: 0.02,
    legendary: 0.005,
    alpha: 0.001,
  },
} as const;

// ========== HELPER FUNCTIONS ==========
/**
 * Calculate coins from XP
 */
export function xpToCoins(xp: number): number {
  return Math.floor(xp / ECONOMY_CONSTANTS.XP_TO_COINS_RATIO);
}

/**
 * Calculate XP required for coins
 */
export function coinsToXP(coins: number): number {
  return coins * ECONOMY_CONSTANTS.XP_TO_COINS_RATIO;
}

/**
 * Get coin reward for an action
 */
export function getCoinReward(action: keyof typeof ECONOMY_CONSTANTS.REWARDS): number {
  return ECONOMY_CONSTANTS.REWARDS[action] || 0;
}

/**
 * Get pricing range for a cosmetic rarity
 */
export function getPriceRange(rarity: keyof typeof ECONOMY_CONSTANTS.COSMETIC_PRICING): { min: number; max: number } {
  return ECONOMY_CONSTANTS.COSMETIC_PRICING[rarity];
}

/**
 * Get season end reward for a rank
 */
export function getSeasonEndReward(rank: number): { xp: number; coins: number; diamondsBonus: number } | null {
  const rewards = ECONOMY_CONSTANTS.LEADERBOARD.seasonEndRewards;
  
  if (rank === 1) return rewards[1];
  if (rank === 2) return rewards[2];
  if (rank === 3) return rewards[3];
  if (rank >= 4 && rank <= 10) return rewards['4-10'];
  if (rank >= 11 && rank <= 50) return rewards['11-50'];
  
  return null;
}

// Type exports for constants
export type DifficultyLevel = keyof typeof XP_CONSTANTS.DIFFICULTY;
export type CurrencyType = keyof typeof CURRENCY_CONSTANTS.SYMBOLS;
export type KarmaTier = keyof typeof KARMA_CONSTANTS.TIERS;
export type PrestigeTier = keyof typeof PRESTIGE_CONSTANTS.TIERS;


