/**
 * Reward Service
 * Centralized reward calculation logic with multipliers and scaling
 * v0.26.1 - Reward Economy & Scaling Pass
 */

import { RewardConfig, DifficultyLevel } from '@/lib/config/rewardConfig';
import { logger } from '@/lib/logger';

export interface RewardCalculationOptions {
  streak?: number;
  power?: number;
  difficulty?: DifficultyLevel;
  applyStreakMultiplier?: boolean; // false for achievements
  applyPowerScaling?: boolean;     // false for non-combat actions
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
export function calculateReward(
  baseXp: number,
  baseGold: number,
  options: RewardCalculationOptions = {}
): RewardResult {
  const {
    streak = 0,
    power = 0,
    difficulty = 'normal',
    applyStreakMultiplier = true,
    applyPowerScaling = false,
  } = options;

  // Streak multiplier (capped)
  const streakMult = applyStreakMultiplier
    ? Math.min(
        1 + streak * RewardConfig.streakMultiplier.perKill,
        RewardConfig.streakMultiplier.max
      )
    : 1.0;

  // Difficulty multiplier
  const diffMult = RewardConfig.difficultyMultiplier[difficulty] || 1.0;

  // Power scaling (only for combat)
  const powerMult = applyPowerScaling
    ? Math.min(
        RewardConfig.powerScaling.base + power * RewardConfig.powerScaling.perPower,
        RewardConfig.powerScaling.cap
      )
    : 1.0;

  // Calculate final rewards
  const finalXp = Math.round(baseXp * streakMult * diffMult * powerMult);
  const finalGold = Math.round(baseGold * streakMult * diffMult);

  // Apply safety caps
  const cappedXp = Math.min(finalXp, RewardConfig.caps.maxXp);
  const cappedGold = Math.min(finalGold, RewardConfig.caps.maxGold);

  // Overall multiplier for display
  const totalMultiplier = streakMult * diffMult * powerMult;

  const result: RewardResult = {
    xp: cappedXp,
    gold: cappedGold,
    multiplier: totalMultiplier,
    breakdown: {
      baseXp,
      baseGold,
      streakMult,
      diffMult,
      powerMult,
      finalXp: cappedXp,
      finalGold: cappedGold,
    },
  };

  // Debug logging
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_REWARDS === 'true') {
    logger.debug('[RewardCalc]', {
      base: { xp: baseXp, gold: baseGold },
      multipliers: { streak: streakMult, difficulty: diffMult, power: powerMult },
      final: { xp: cappedXp, gold: cappedGold },
      totalMultiplier: totalMultiplier.toFixed(2),
    });
  }

  return result;
}

/**
 * Helper to get base reward for a reward type
 */
export function getBaseReward(type: keyof typeof RewardConfig): { xp: number; gold: number } {
  return RewardConfig[type] || RewardConfig.base;
}

/**
 * Calculate combat kill reward
 */
export function calculateCombatKillReward(
  streak: number,
  power: number = 0,
  isBoss: boolean = false
): RewardResult {
  const base = isBoss ? RewardConfig.boss : RewardConfig.kill;
  return calculateReward(base.xp, base.gold, {
    streak,
    power,
    difficulty: isBoss ? 'boss' : 'normal',
    applyStreakMultiplier: true,
    applyPowerScaling: true,
  });
}

/**
 * Calculate reflection reward
 */
export function calculateReflectionReward(): RewardResult {
  return calculateReward(
    RewardConfig.reflection.xp,
    RewardConfig.reflection.gold,
    {
      applyStreakMultiplier: false,
      applyPowerScaling: false,
      difficulty: 'normal',
    }
  );
}

/**
 * Calculate quiz reward
 */
export function calculateQuizReward(difficulty: DifficultyLevel = 'normal'): RewardResult {
  return calculateReward(
    RewardConfig.quiz.xp,
    RewardConfig.quiz.gold,
    {
      applyStreakMultiplier: false,
      applyPowerScaling: false,
      difficulty,
    }
  );
}

/**
 * Calculate achievement reward (no multipliers)
 */
export function calculateAchievementReward(xpReward: number, goldReward: number): RewardResult {
  return calculateReward(xpReward, goldReward, {
    applyStreakMultiplier: false,
    applyPowerScaling: false,
    difficulty: 'normal',
  });
}

