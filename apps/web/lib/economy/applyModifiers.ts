/**
 * Economy Modifiers Application
 * v0.34.2 - Unified utility to apply all economy modifiers to rewards
 */

import { prisma } from '@/lib/db';
import { getEconomyModifiers } from './seedModifiers';
import { getCurrentWeeklyModifier } from './weeklyModifiers';
import { getStreakMultiplier } from './streakTracker';

export interface RewardInput {
  baseXp?: number;
  baseGold?: number;
  userId: string;
  actionType?: 'social' | 'challenge' | 'reflection' | 'general';
}

export interface RewardOutput {
  finalXp: number;
  finalGold: number;
  appliedModifiers: {
    name: string;
    multiplier: number;
  }[];
  breakdown: {
    baseXp: number;
    baseGold: number;
    streakBonus: number;
    socialBonus: number;
    weeklyBonus: number;
  };
}

/**
 * Apply all active economy modifiers to a reward
 * This is the central function called by all reward distribution logic
 */
export async function applyEconomyModifiers(input: RewardInput): Promise<RewardOutput> {
  const { baseXp = 0, baseGold = 0, userId, actionType = 'general' } = input;

  // Get all modifier settings
  const modifiers = await getEconomyModifiers();
  const weeklyModifier = await getCurrentWeeklyModifier();
  const streakMultiplier = await getStreakMultiplier(userId);

  const appliedModifiers: { name: string; multiplier: number }[] = [];

  // Start with base values
  let finalXp = baseXp;
  let finalGold = baseGold;

  // 1. Apply streak bonus (applies to all XP)
  const streakBonus = streakMultiplier;
  if (streakBonus > 1) {
    finalXp *= streakBonus;
    appliedModifiers.push({
      name: 'Streak Bonus',
      multiplier: streakBonus,
    });
  }

  // 2. Apply social multiplier (only for social actions)
  const socialMultiplier = modifiers.social_xp_multiplier ?? 1.0;
  const socialBonus = actionType === 'social' ? socialMultiplier : 1.0;
  if (actionType === 'social' && socialBonus > 1) {
    finalXp *= socialBonus;
    appliedModifiers.push({
      name: 'Social Action Bonus',
      multiplier: socialBonus,
    });
  }

  // 3. Apply weekly modifier
  let weeklyBonus = 1.0;
  if (weeklyModifier && weeklyModifier.isActive) {
    const weeklyValue = modifiers.weekly_modifier_value ?? 1.0;
    
    if (weeklyModifier.bonusType === 'xp') {
      finalXp *= weeklyValue;
      weeklyBonus = weeklyValue;
      appliedModifiers.push({
        name: weeklyModifier.name,
        multiplier: weeklyValue,
      });
    } else if (weeklyModifier.bonusType === 'gold') {
      finalGold *= weeklyValue;
      weeklyBonus = weeklyValue;
      appliedModifiers.push({
        name: weeklyModifier.name,
        multiplier: weeklyValue,
      });
    } else if (weeklyModifier.bonusType === 'social' && actionType === 'social') {
      finalXp *= weeklyValue;
      weeklyBonus = weeklyValue;
      appliedModifiers.push({
        name: weeklyModifier.name,
        multiplier: weeklyValue,
      });
    } else if (weeklyModifier.bonusType === 'streak') {
      // Double the streak bonus
      const extraStreakBonus = (streakBonus - 1) * (weeklyValue - 1);
      finalXp *= 1 + extraStreakBonus;
      weeklyBonus = 1 + extraStreakBonus;
      appliedModifiers.push({
        name: weeklyModifier.name,
        multiplier: weeklyValue,
      });
    }
  }

  return {
    finalXp: Math.round(finalXp),
    finalGold: Math.round(finalGold),
    appliedModifiers,
    breakdown: {
      baseXp,
      baseGold,
      streakBonus,
      socialBonus,
      weeklyBonus,
    },
  };
}

/**
 * Helper: Apply modifiers to XP only
 */
export async function applyXpModifiers(
  baseXp: number,
  userId: string,
  actionType?: 'social' | 'challenge' | 'reflection' | 'general'
): Promise<number> {
  const result = await applyEconomyModifiers({
    baseXp,
    baseGold: 0,
    userId,
    actionType,
  });
  return result.finalXp;
}

/**
 * Helper: Apply modifiers to gold only
 */
export async function applyGoldModifiers(baseGold: number, userId: string): Promise<number> {
  const result = await applyEconomyModifiers({
    baseXp: 0,
    baseGold,
    userId,
  });
  return result.finalGold;
}

/**
 * Get summary of all active modifiers for display
 */
export async function getActiveModifiersSummary(userId: string): Promise<{
  streak: { active: boolean; multiplier: number; days: number };
  social: { active: boolean; multiplier: number };
  weekly: { active: boolean; name: string; description: string; multiplier: number } | null;
}> {
  const modifiers = await getEconomyModifiers();
  const weeklyModifier = await getCurrentWeeklyModifier();
  const streakMultiplier = await getStreakMultiplier(userId);

  const streakDays = Math.round((streakMultiplier - 1) / (modifiers.streak_xp_bonus ?? 0.05));

  return {
    streak: {
      active: streakMultiplier > 1,
      multiplier: streakMultiplier,
      days: streakDays,
    },
    social: {
      active: (modifiers.social_xp_multiplier ?? 1.0) > 1,
      multiplier: modifiers.social_xp_multiplier ?? 1.0,
    },
    weekly: weeklyModifier?.isActive
      ? {
          active: true,
          name: weeklyModifier.name,
          description: weeklyModifier.description,
          multiplier: modifiers.weekly_modifier_value ?? 1.0,
        }
      : null,
  };
}

