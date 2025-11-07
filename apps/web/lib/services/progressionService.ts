/**
 * Progression Service
 * Handles XP, leveling, stat calculations, and archetype bonuses
 * v0.26.6 - Archetypes & Leveling
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ARCHETYPES, getArchetype, calculateStatsForLevel } from '@/lib/config/archetypeConfig';

// XP table: XP required for each level
// level 1 = 0, level 2 = 100, level 3 = 250, etc.
const XP_TABLE = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  800,    // Level 5
  1200,   // Level 6
  1800,   // Level 7
  2500,   // Level 8
  3500,   // Level 9
  5000,   // Level 10
  7000,   // Level 11
  9500,   // Level 12
  12500,  // Level 13
  16000,  // Level 14
  20000,  // Level 15
  25000,  // Level 16
  31000,  // Level 17
  38000,  // Level 18
  46000,  // Level 19
  55000,  // Level 20
];

const MAX_LEVEL = 100; // Cap to prevent overflow
const REROLL_COOLDOWN_HOURS = 24;
const REROLL_COST = 1000; // Gold cost to reroll archetype

export interface Stats {
  str: number;
  int: number;
  cha: number;
  luck: number;
}

/**
 * Get level from total XP
 */
export function getLevel(xp: number): number {
  for (let level = 1; level < XP_TABLE.length; level++) {
    if (xp < XP_TABLE[level]) {
      return level;
    }
  }
  
  // Beyond table, use formula: 55000 + (level - 20) * 5000
  if (xp < 55000) {
    return XP_TABLE.length;
  }
  
  const baseXP = 55000;
  const additionalLevels = Math.floor((xp - baseXP) / 5000);
  return Math.min(20 + additionalLevels, MAX_LEVEL);
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) {
    return 0; // Max level reached
  }
  
  if (currentLevel < XP_TABLE.length) {
    return XP_TABLE[currentLevel];
  }
  
  // Beyond table
  const baseXP = 55000;
  const additionalLevels = currentLevel - 20;
  return baseXP + additionalLevels * 5000;
}

/**
 * Get XP progress for current level
 */
export function getXPProgress(xp: number, level: number): {
  currentXP: number;
  requiredXP: number;
  progress: number; // 0-1
} {
  const requiredXP = getXPForNextLevel(level);
  const previousLevelXP = level > 1 ? XP_TABLE[level - 1] || 0 : 0;
  const currentXP = xp - previousLevelXP;
  const progress = requiredXP > 0 ? currentXP / (requiredXP - previousLevelXP) : 1;
  
  return {
    currentXP: Math.max(0, currentXP),
    requiredXP: requiredXP - previousLevelXP,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

/**
 * Add XP to user and handle level ups
 */
export async function addXP(
  userId: string,
  amount: number,
  source?: string
): Promise<{
  level: number;
  xp: number;
  leveledUp: boolean;
  newLevel?: number;
}> {
  if (amount <= 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, xp: true },
    });
    return {
      level: user?.level || 1,
      xp: user?.xp || 0,
      leveledUp: false,
    };
  }

  // Get current user state
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      level: true,
      archetypeKey: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const oldLevel = user.level;
  const oldXP = user.xp;
  
  // Apply archetype XP bonus if applicable
  let adjustedAmount = amount;
  if (user.archetypeKey) {
    const archetype = getArchetype(user.archetypeKey);
    if (archetype?.bonuses.xp?.generalBonus) {
      adjustedAmount = Math.floor(amount * (1 + archetype.bonuses.xp.generalBonus));
    }
  }

  // Cap XP to prevent overflow
  const newXP = Math.min(oldXP + adjustedAmount, XP_TABLE[MAX_LEVEL] || 999999999);
  const newLevel = getLevel(newXP);

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
    },
  });

  const leveledUp = newLevel > oldLevel;

  // Handle level up
  if (leveledUp) {
    await handleLevelUp(userId, oldLevel, newLevel);
  }

  logger.debug('[ProgressionService] XP added', {
    userId,
    amount,
    adjustedAmount,
    oldXP,
    newXP,
    oldLevel,
    newLevel,
    leveledUp,
    source,
  });

  return {
    level: newLevel,
    xp: newXP,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  };
}

/**
 * Handle level up - update stats and notify
 */
export async function handleLevelUp(
  userId: string,
  oldLevel: number,
  newLevel: number
): Promise<void> {
  // Get user archetype
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      archetypeKey: true,
      stats: true,
    },
  });

  if (!user || !user.archetypeKey) {
    // No archetype, just update level
    logger.info(`[ProgressionService] User ${userId} leveled up: ${oldLevel} → ${newLevel} (no archetype)`);
    return;
  }

  const archetype = getArchetype(user.archetypeKey);
  if (!archetype) {
    logger.warn(`[ProgressionService] Unknown archetype: ${user.archetypeKey}`);
    return;
  }

  // Calculate new stats for new level
  const newStats = calculateStatsForLevel(archetype, newLevel);

  // Update user stats
  await prisma.user.update({
    where: { id: userId },
    data: {
      stats: newStats as any, // Prisma Json type
    },
  });

  logger.info(`[ProgressionService] User ${userId} leveled up: ${oldLevel} → ${newLevel} (${user.archetypeKey})`, {
    oldStats: user.stats,
    newStats,
  });
}

/**
 * Select archetype for user
 */
export async function selectArchetype(
  userId: string,
  archetypeKey: string
): Promise<{
  success: boolean;
  stats: Stats;
}> {
  const archetype = getArchetype(archetypeKey);
  if (!archetype) {
    throw new Error(`Invalid archetype: ${archetypeKey}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate stats for current level
  const stats = calculateStatsForLevel(archetype, user.level);

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      archetypeKey,
      stats: stats as any,
    },
  });

  logger.info(`[ProgressionService] User ${userId} selected archetype: ${archetypeKey}`, { stats });

  return {
    success: true,
    stats,
  };
}

/**
 * Reroll archetype (with cooldown and cost)
 */
export async function rerollArchetype(userId: string): Promise<{
  success: boolean;
  costPaid: number;
  newStats: Stats;
  error?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      funds: true,
      lastArchetypeReroll: true,
      level: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check cooldown
  if (user.lastArchetypeReroll) {
    const cooldownMs = REROLL_COOLDOWN_HOURS * 60 * 60 * 1000;
    const timeSinceReroll = Date.now() - user.lastArchetypeReroll.getTime();
    
    if (timeSinceReroll < cooldownMs) {
      const hoursRemaining = Math.ceil((cooldownMs - timeSinceReroll) / (60 * 60 * 1000));
      throw new Error(`Reroll cooldown active. ${hoursRemaining} hours remaining.`);
    }
  }

  // Check funds
  const userGold = Number(user.funds);
  if (userGold < REROLL_COST) {
    throw new Error(`Insufficient funds. Need ${REROLL_COST} gold, have ${userGold}`);
  }

  // Deduct cost and update last reroll time
  await prisma.user.update({
    where: { id: userId },
    data: {
      funds: { decrement: REROLL_COST },
      lastArchetypeReroll: new Date(),
      archetypeKey: null, // Clear archetype (user must select new one)
      stats: null, // Clear stats
    },
  });

  logger.info(`[ProgressionService] User ${userId} rerolled archetype (cost: ${REROLL_COST})`);

  return {
    success: true,
    costPaid: REROLL_COST,
    newStats: { str: 0, int: 0, cha: 0, luck: 0 }, // Reset stats
  };
}

/**
 * Get user stats (with archetype bonuses applied)
 */
export async function getUserStats(userId: string): Promise<{
  stats: Stats | null;
  archetype: string | null;
  level: number;
  xp: number;
  xpProgress: ReturnType<typeof getXPProgress>;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      level: true,
      xp: true,
      archetypeKey: true,
      stats: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const stats = user.stats as Stats | null;
  const xpProgress = getXPProgress(user.xp, user.level);

  return {
    stats,
    archetype: user.archetypeKey,
    level: user.level,
    xp: user.xp,
    xpProgress,
  };
}

