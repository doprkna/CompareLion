/**
 * Archetype Auto-Classification
 * Calculates user archetype based on playstyle and stats
 * v0.36.24 - Social Profiles 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export type ArchetypeType =
  | 'Strategist'
  | 'Explorer'
  | 'Collector'
  | 'Socializer'
  | 'Challenger'
  | 'Sage'
  | 'Trickster'
  | 'Balanced';

interface ArchetypeWeights {
  strategist: number;
  explorer: number;
  collector: number;
  socializer: number;
  challenger: number;
  sage: number;
  trickster: number;
  balanced: number;
}

interface UserActivityData {
  fightsWon: number;
  fightsTotal: number;
  comparisonsMade: number;
  questionsAnswered: number;
  inventoryItems: number;
  critRate: number;
  defense: number;
  wisdomScore?: number; // From questions/reflections
}

/**
 * Calculate archetype weights based on user activity
 */
function calculateWeights(data: UserActivityData): ArchetypeWeights {
  const weights: ArchetypeWeights = {
    strategist: 0,
    explorer: 0,
    collector: 0,
    socializer: 0,
    challenger: 0,
    sage: 0,
    trickster: 0,
    balanced: 0,
  };

  // Challenger: fights won
  weights.challenger = data.fightsWon * 2;

  // Socializer: comparisons made
  weights.socializer = data.comparisonsMade * 2;

  // Explorer: questions answered
  weights.explorer = data.questionsAnswered * 2;

  // Collector: inventory items
  weights.collector = data.inventoryItems * 1;

  // Trickster: high crit rate (>20%)
  if (data.critRate > 20) {
    weights.trickster = Math.floor(data.critRate / 10) * 2;
  }

  // Strategist: high winrate + high defense
  const winrate = data.fightsTotal > 0 ? (data.fightsWon / data.fightsTotal) * 100 : 0;
  if (winrate > 60 && data.defense > 50) {
    weights.strategist = Math.floor(winrate / 10) + Math.floor(data.defense / 20);
  }

  // Sage: high wisdom score from questions/reflections
  if (data.wisdomScore && data.wisdomScore > 50) {
    weights.sage = Math.floor(data.wisdomScore / 10) * 2;
  }

  // Balanced: if no single category dominates
  const maxWeight = Math.max(...Object.values(weights));
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (maxWeight > 0 && maxWeight / totalWeight < 0.4) {
    weights.balanced = Math.floor(totalWeight / 5);
  }

  return weights;
}

/**
 * Determine archetype from weights
 */
function determineArchetype(weights: ArchetypeWeights): ArchetypeType {
  const entries = Object.entries(weights) as [keyof ArchetypeWeights, number][];
  entries.sort((a, b) => b[1] - a[1]);

  const [topType, topWeight] = entries[0];
  const [secondType, secondWeight] = entries[1];

  // If top weight is significantly higher, use it
  if (topWeight > secondWeight * 1.5) {
    return mapWeightToArchetype(topType);
  }

  // If weights are close, prefer Balanced
  if (topWeight > 0 && topWeight / (topWeight + secondWeight) < 0.6) {
    return 'Balanced';
  }

  return mapWeightToArchetype(topType);
}

/**
 * Map weight key to archetype name
 */
function mapWeightToArchetype(key: keyof ArchetypeWeights): ArchetypeType {
  const map: Record<keyof ArchetypeWeights, ArchetypeType> = {
    strategist: 'Strategist',
    explorer: 'Explorer',
    collector: 'Collector',
    socializer: 'Socializer',
    challenger: 'Challenger',
    sage: 'Sage',
    trickster: 'Trickster',
    balanced: 'Balanced',
  };
  return map[key];
}

/**
 * Get user activity data for archetype calculation
 */
async function getUserActivityData(userId: string): Promise<UserActivityData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      combatKills: true,
      combatBattles: true,
      questionsAnswered: true,
      stats: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get comparisons count
  // TODO: Track comparisons properly when comparison tracking is implemented
  // For now, estimate based on user activity or use 0
  const comparisonsCount = 0; // Placeholder - will be implemented when comparison tracking is added

  // Get inventory items count
  const inventoryCount = await prisma.inventoryItem.count({
    where: { userId },
  });

  // Calculate crit rate (from stats or combat data)
  const stats = (user.stats || {}) as { luck?: number; crit?: number };
  const critRate = stats.crit || (stats.luck ? stats.luck / 5 : 0);

  // Calculate defense (from stats)
  const defense = (stats as any).def || (stats as any).cha || 0;

  // Calculate wisdom score (from questions answered + reflections)
  const reflectionsCount = await prisma.userReflection.count({
    where: { userId },
  });
  const wisdomScore = Math.min(100, (user.questionsAnswered || 0) + reflectionsCount * 2);

  return {
    fightsWon: user.combatKills || 0,
    fightsTotal: user.combatBattles || 0,
    comparisonsMade: comparisonsCount, // TODO: Fix when comparison schema is known
    questionsAnswered: user.questionsAnswered || 0,
    inventoryItems: inventoryCount,
    critRate,
    defense,
    wisdomScore,
  };
}

/**
 * Calculate and update user archetype
 */
export async function calculateUserArchetype(userId: string): Promise<ArchetypeType> {
  try {
    const activityData = await getUserActivityData(userId);
    const weights = calculateWeights(activityData);
    const archetype = determineArchetype(weights);

    // Update user archetype
    await prisma.user.update({
      where: { id: userId },
      data: { archetype },
    });

    logger.info(`[ArchetypeCalc] User ${userId} archetype: ${archetype}`, { weights, activityData });

    return archetype;
  } catch (error) {
    logger.error('[ArchetypeCalc] Failed to calculate archetype', { userId, error });
    throw error;
  }
}

/**
 * Get archetype for user (calculate if not set)
 */
export async function getUserArchetype(userId: string): Promise<ArchetypeType> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { archetype: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // If archetype is set and not null, return it
  if (user.archetype && user.archetype !== 'Adventurer') {
    return user.archetype as ArchetypeType;
  }

  // Otherwise, calculate it
  return await calculateUserArchetype(userId);
}

