/**
 * Reward Economy Configuration
 * Centralized reward values and multipliers for XP, gold, and bonuses
 * v0.26.1 - Reward Economy & Scaling Pass
 * 
 * All reward calculations pull from here.
 * Edit this file to tune the entire economy.
 */

export const RewardConfig = {
  // Base rewards per action type
  base: { xp: 10, gold: 2 },
  kill: { xp: 50, gold: 10 },
  boss: { xp: 200, gold: 60 }, // Boss base (before bonuses)
  reflection: { xp: 25, gold: 5 },
  quiz: { xp: 20, gold: 5 },
  achievement: { xp: 100, gold: 0 },
  
  // Streak multipliers
  streakMultiplier: {
    perKill: 0.05, // 5% bonus per streak kill
    max: 2.0,      // Cap at 2x (100% bonus)
  },
  
  // Difficulty multipliers
  difficultyMultiplier: {
    easy: 0.8,
    normal: 1.0,
    hard: 1.2,
    boss: 2.5,
  },
  
  // Power scaling (from equipped items)
  powerScaling: {
    base: 1.0,
    perPower: 0.01, // 1% per power point
    cap: 1.5,       // Cap at 50% bonus
  },
  
  // Safety caps (prevent overflow)
  caps: {
    maxXp: 1000000,   // Max XP in single reward
    maxGold: 100000,  // Max gold in single reward
  },
  
  // Item drop rates (v0.26.5)
  drops: {
    rare: 0.05,       // 5% chance for rare item
    epic: 0.02,       // 2% chance for epic item
    legendary: 0.005, // 0.5% chance for legendary item
    alpha: 0.001,     // 0.1% chance for alpha item
  },
} as const;

export type DifficultyLevel = keyof typeof RewardConfig.difficultyMultiplier;

