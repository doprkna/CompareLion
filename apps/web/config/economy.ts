/**
 * Economy Configuration
 * v0.18.0 - Season & Economy System
 */

export const ECONOMY_CONFIG = {
  // XP to Coins conversion
  xpToCoinsRatio: 10, // 10 XP = 1 coin
  
  // Coin rewards per action
  rewards: {
    questionAnswered: 1,        // Base reward for answering a question
    correctAnswer: 2,           // Bonus for correct answer
    dailyLogin: 5,              // Daily login bonus
    streakBonus: 3,             // Per day of streak
    submissionApproved: 25,     // UGC submission approved
    eventParticipation: 10,     // Event participation
    upvoteReceived: 1,          // Per upvote on UGC
  },
  
  // Season settings
  season: {
    durationDays: 90,           // Default season length (3 months)
    resetOnNewSeason: {
      coins: true,              // Reset coins to 0
      seasonalXP: true,         // Reset seasonal XP to 0
      leaderboard: true,        // Reset leaderboard rankings
      cosmetics: false,         // Keep purchased cosmetics
    },
    archiveData: true,          // Archive season stats
  },
  
  // Shop settings
  shop: {
    refreshHours: 24,           // Shop refresh interval
    featuredItemsCount: 3,      // Number of featured items
  },
  
  // Cosmetic pricing by rarity
  cosmeticPricing: {
    COMMON: { min: 10, max: 50 },
    UNCOMMON: { min: 50, max: 100 },
    RARE: { min: 100, max: 250 },
    EPIC: { min: 250, max: 500 },
    LEGENDARY: { min: 500, max: 1000 },
  },
  
  // Leaderboard settings
  leaderboard: {
    topPlayersCount: 100,       // Number of players to track in leaderboard
    updateIntervalMinutes: 5,   // Cache refresh interval
    rewardTopPlayers: true,     // Reward top players at season end
    seasonEndRewards: {
      1: { xp: 500, coins: 0, diamondsBonus: 100 },
      2: { xp: 300, coins: 0, diamondsBonus: 50 },
      3: { xp: 200, coins: 0, diamondsBonus: 25 },
      '4-10': { xp: 100, coins: 0, diamondsBonus: 10 },
      '11-50': { xp: 50, coins: 0, diamondsBonus: 5 },
    },
  },
} as const;

/**
 * Calculate coins from XP
 */
export function xpToCoins(xp: number): number {
  return Math.floor(xp / ECONOMY_CONFIG.xpToCoinsRatio);
}

/**
 * Calculate XP required for a certain number of coins
 */
export function coinsToXP(coins: number): number {
  return coins * ECONOMY_CONFIG.xpToCoinsRatio;
}

/**
 * Get coin reward for an action
 */
export function getCoinReward(action: keyof typeof ECONOMY_CONFIG.rewards): number {
  return ECONOMY_CONFIG.rewards[action] || 0;
}

/**
 * Get pricing range for a cosmetic rarity
 */
export function getPriceRange(rarity: keyof typeof ECONOMY_CONFIG.cosmeticPricing): { min: number; max: number } {
  return ECONOMY_CONFIG.cosmeticPricing[rarity];
}

/**
 * Check if user can afford an item
 */
export function canAfford(userCoins: number, itemPrice: number): boolean {
  return userCoins >= itemPrice;
}

/**
 * Calculate season end reward for a rank
 */
export function getSeasonEndReward(rank: number): { xp: number; coins: number; diamondsBonus: number } | null {
  const rewards = ECONOMY_CONFIG.leaderboard.seasonEndRewards;
  
  if (rank === 1) return rewards[1];
  if (rank === 2) return rewards[2];
  if (rank === 3) return rewards[3];
  if (rank >= 4 && rank <= 10) return rewards['4-10'];
  if (rank >= 11 && rank <= 50) return rewards['11-50'];
  
  return null;
}

