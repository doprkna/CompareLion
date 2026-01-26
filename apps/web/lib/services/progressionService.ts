/**
 * Progression Service
 * Handles XP, leveling, stat calculations, and archetype bonuses
 * v0.26.6 - Archetypes & Leveling
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ARCHETYPES, getArchetype, calculateStatsForLevel } from '@parel/core/config/archetypeConfig';
import { getTotalItemPower } from '@/lib/services/itemService';
import { checkAndUnlockAchievements } from './achievementChecker';
import { getLevelFromXP, getXPForLevel, getXPForNextLevel as getXPForNextLevelNew } from '@/lib/levelCurve';

const MAX_LEVEL = 100; // Cap to prevent overflow
const REROLL_COOLDOWN_HOURS = 24;
const REROLL_COST = 1000; // Gold cost to reroll archetype
const ATTRIBUTE_POINTS_PER_LEVEL = 2; // v0.36.34 - Stats 2.0

export interface Stats {
  str: number;
  int: number;
  cha: number;
  luck: number;
}

/**
 * Get level from total XP (v0.36.34 - uses new level curve)
 */
export function getLevel(xp: number): number {
  return getLevelFromXP(xp);
}

/**
 * Get XP required for next level (v0.36.34 - uses new level curve)
 */
export function getXPForNextLevel(currentLevel: number): number {
  return getXPForNextLevelNew(currentLevel);
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

  // Cap XP to prevent overflow (v0.36.34 - new level curve)
  const maxXP = getXPForLevel(MAX_LEVEL);
  const newXP = Math.min(oldXP + adjustedAmount, maxXP);
  let newLevel = getLevel(newXP);

  // Handle recursive level-ups (XP overflow) - v0.36.34
  // If user has enough XP for multiple levels, level up recursively
  while (newLevel < MAX_LEVEL) {
    const nextLevelXP = getXPForLevel(newLevel + 1);
    if (newXP >= nextLevelXP) {
      newLevel++;
    } else {
      break;
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
    },
  });

  const leveledUp = newLevel > oldLevel;

  // Handle level up and update stats
  if (leveledUp) {
    // Award attribute points (v0.36.34 - Stats 2.0)
    // +2 points per level gained
    const levelsGained = newLevel - oldLevel;
    const pointsToAward = levelsGained * ATTRIBUTE_POINTS_PER_LEVEL;
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          unspentPoints: {
            increment: pointsToAward,
          },
        },
      });
      logger.info(`[ProgressionService] Awarded ${pointsToAward} attribute points for level ${oldLevel} → ${newLevel}`);
    } catch (error) {
      // Don't fail if unspentPoints field doesn't exist yet (backward compatibility)
      logger.debug('[ProgressionService] Failed to award attribute points (field may not exist)', error);
    }
    
    await handleLevelUp(userId, oldLevel, newLevel);
    
    // Auto-unlock skills every 5 levels (v0.36.33)
    try {
      const { unlockSkill, MVP_SKILLS, seedSkills } = await import('@/lib/services/skillService');
      const { prisma } = await import('@/lib/db');
      
      // Ensure skills are seeded
      await seedSkills();
      
      // Check if we should unlock a skill (every 5 levels: 5, 10, 15, 20, etc.)
      if (newLevel % 5 === 0) {
        // Get all skills
        const allSkills = await prisma.skill.findMany({
          orderBy: [
            { type: 'asc' }, // Passives first
            { name: 'asc' },
          ],
        });
        
        // Get user's current skills
        const userSkills = await prisma.userSkill.findMany({
          where: { userId },
          select: { skillId: true },
        });
        
        const unlockedSkillIds = new Set(userSkills.map((us) => us.skillId));
        
        // Find first skill user doesn't have
        const skillToUnlock = allSkills.find((skill) => !unlockedSkillIds.has(skill.id));
        
        if (skillToUnlock) {
          await unlockSkill(userId, skillToUnlock.id);
          logger.info(`[ProgressionService] Auto-unlocked skill ${skillToUnlock.name} at level ${newLevel}`);
        }
      }
    } catch (error) {
      // Don't fail level up if skill unlock fails
      logger.debug('[ProgressionService] Skill unlock failed', error);
    }
    
    // Create feed post for level up (v0.36.25)
    try {
      const { postLevelUp } = await import('@/lib/services/feedService');
      await postLevelUp(userId, newLevel);
    } catch (error) {
      // Don't fail level up if feed post fails
      logger.debug('[ProgressionService] Feed post failed', error);
    }

    // Create notification for level up (v0.36.26)
    try {
      const { notifyLevelUp } = await import('@/lib/services/notificationService');
      await notifyLevelUp(userId, newLevel);
    } catch (error) {
      // Don't fail level up if notification fails
      logger.debug('[ProgressionService] Notification failed', error);
    }
    
    // Check achievements for level milestones
    await checkAndUnlockAchievements(userId, {
      heroLevel: newLevel,
    });
  } else {
    // Even without level up, ensure stats are recalculated (equipment may have changed)
    await updateHeroStats(userId);
  }

  // Add XP to season pass (v0.36.23)
  try {
    const { addSeasonXP } = await import('@/lib/season/service');
    await addSeasonXP(userId, adjustedAmount).catch((error) => {
      // Don't fail if season system not available
      logger.debug('[ProgressionService] Season XP not available', error);
    });
  } catch (error) {
    // Season service may not be available - ignore
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
 * v0.36.2 - Uses updateHeroStats() for unified stat calculation
 */
export async function handleLevelUp(
  userId: string,
  oldLevel: number,
  newLevel: number
): Promise<void> {
  // Get user archetype for logging
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      archetypeKey: true,
      stats: true,
    },
  });

  if (!user) {
    logger.warn(`[ProgressionService] User ${userId} not found during level up`);
    return;
  }

  const oldStats = user.stats as Stats | null;

  // Update stats using unified function (includes base + level + equipment)
  const newStats = await updateHeroStats(userId);

  if (user.archetypeKey) {
    logger.info(`[ProgressionService] User ${userId} leveled up: ${oldLevel} → ${newLevel} (${user.archetypeKey})`, {
      oldStats,
      newStats,
    });
  } else {
    logger.info(`[ProgressionService] User ${userId} leveled up: ${oldLevel} → ${newLevel} (no archetype)`, {
      oldStats,
      newStats,
    });
  }
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
 * Update hero stats - single source of truth for stat calculation
 * Calculates: base stats (from archetype) + level bonuses + equipment bonuses
 * v0.36.2 - Hero stats recalculation pipeline
 */
export async function updateHeroStats(userId: string): Promise<Stats> {
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      level: true,
      archetypeKey: true,
      stats: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Start with base stats (0 if no archetype)
  let finalStats: Stats = { str: 0, int: 0, cha: 0, luck: 0 };

  // Calculate base stats + level bonuses from archetype
  if (user.archetypeKey) {
    const archetype = getArchetype(user.archetypeKey);
    if (archetype) {
      finalStats = calculateStatsForLevel(archetype, user.level);
    }
  }

  // Add equipment bonuses (item power contributes to stats proportionally)
  // Formula: item power / 10 = stat bonus distributed across stats
  try {
    const itemPower = await getTotalItemPower(userId);
    if (itemPower > 0) {
      // Distribute item power bonus across stats (25% each)
      const powerBonus = Math.floor(itemPower / 10);
      finalStats.str += Math.floor(powerBonus * 0.25);
      finalStats.int += Math.floor(powerBonus * 0.25);
      finalStats.cha += Math.floor(powerBonus * 0.25);
      finalStats.luck += Math.floor(powerBonus * 0.25);
    }
  } catch (error) {
    // If item service fails, continue without equipment bonuses
    logger.warn(`[ProgressionService] Failed to get item power for ${userId}`, error);
  }

  // Ensure no negative stats
  finalStats.str = Math.max(0, finalStats.str);
  finalStats.int = Math.max(0, finalStats.int);
  finalStats.cha = Math.max(0, finalStats.cha);
  finalStats.luck = Math.max(0, finalStats.luck);

  // Persist to database
  await prisma.user.update({
    where: { id: userId },
    data: {
      stats: finalStats as any, // Prisma Json type
    },
  });

  logger.debug('[ProgressionService] Hero stats updated', {
    userId,
    level: user.level,
    archetype: user.archetypeKey,
    stats: finalStats,
  });

  return finalStats;
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

