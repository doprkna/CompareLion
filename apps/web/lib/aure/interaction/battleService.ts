/**
 * AURE Interaction Engine - Faction Battle Service 2.0
 * Weekly archetype wars based on member activity
 * v0.39.7 - Faction Battle 2.0 (Archetype Wars)
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getUserArchetype } from '@/lib/aure/life/archetypeService';
import { ARCHETYPE_CATALOG, getAllArchetypeIds } from '@/lib/aure/life/archetypes';

export interface FactionBattle {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  archetypeIds: string[];
  scores: Record<string, number>;
  winnerArchetypeId: string | null;
  createdAt: Date;
}

export interface FactionContribution {
  id: string;
  userId: string;
  archetypeId: string;
  battleId: string;
  amount: number;
  source: 'upload' | 'rate' | 'quest' | 'vs' | 'other';
  createdAt: Date;
}

/**
 * Get current week boundaries (Monday to Sunday)
 */
function getCurrentWeekBoundaries(): { weekStart: Date; weekEnd: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday = 0
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
}

/**
 * Pick 2-4 random archetypes for battle
 */
function pickArchetypesForBattle(count: number = 3): string[] {
  const allIds = getAllArchetypeIds();
  const shuffled = [...allIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allIds.length));
}

/**
 * Get or create current battle
 */
export async function getCurrentBattle(): Promise<FactionBattle | null> {
  try {
    const { weekStart, weekEnd } = getCurrentWeekBoundaries();
    
    // Try to find existing battle for this week
    try {
      const existing = await prisma.factionBattle.findFirst({
        where: {
          weekStart: {
            lte: weekEnd,
          },
          weekEnd: {
            gte: weekStart,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (existing) {
        // Parse JSON fields
        const archetypeIds = (existing as any).archetypeIds 
          ? (typeof (existing as any).archetypeIds === 'string' 
              ? JSON.parse((existing as any).archetypeIds) 
              : (existing as any).archetypeIds)
          : [];
        
        const scores = (existing as any).scores
          ? (typeof (existing as any).scores === 'string'
              ? JSON.parse((existing as any).scores)
              : (existing as any).scores)
          : {};

        return {
          id: existing.id,
          weekStart: existing.weekStart,
          weekEnd: existing.weekEnd,
          archetypeIds,
          scores,
          winnerArchetypeId: (existing as any).winnerArchetypeId || null,
          createdAt: existing.createdAt,
        };
      }
    } catch (error: any) {
      // If model doesn't exist yet, log and create new
      if (error.message?.includes('model') || error.message?.includes('FactionBattle')) {
        logger.warn('[AURE Interaction] FactionBattle model not found - Prisma migration required');
        return null;
      }
      throw error;
    }

    // No existing battle, create new one
    const archetypeIds = pickArchetypesForBattle(3);
    const scores: Record<string, number> = {};
    archetypeIds.forEach((id) => {
      scores[id] = 0;
    });

    try {
      const newBattle = await prisma.factionBattle.create({
        data: {
          weekStart,
          weekEnd,
          archetypeIds: archetypeIds as any, // JSON field
          scores: scores as any, // JSON field
          winnerArchetypeId: null,
        },
      });

      return {
        id: newBattle.id,
        weekStart: newBattle.weekStart,
        weekEnd: newBattle.weekEnd,
        archetypeIds,
        scores,
        winnerArchetypeId: null,
        createdAt: newBattle.createdAt,
      };
    } catch (error: any) {
      // If model doesn't exist yet, return null
      if (error.message?.includes('model') || error.message?.includes('FactionBattle')) {
        logger.warn('[AURE Interaction] FactionBattle model not found - Prisma migration required');
        return null;
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to get current battle', { error });
    return null;
  }
}

/**
 * Record faction contribution
 */
export async function recordFactionContribution(
  userId: string,
  source: 'upload' | 'rate' | 'quest' | 'vs' | 'other',
  amount: number = 1
): Promise<{ success: boolean; battleId?: string }> {
  try {
    // Get user's archetype
    const userArchetype = await getUserArchetype(userId);
    if (!userArchetype || !userArchetype.archetypeId) {
      logger.warn('[AURE Interaction] User has no archetype', { userId });
      return { success: false };
    }

    // Get current battle
    const battle = await getCurrentBattle();
    if (!battle) {
      logger.warn('[AURE Interaction] No active battle', { userId });
      return { success: false };
    }

    // Check if user's archetype is participating
    if (!battle.archetypeIds.includes(userArchetype.archetypeId)) {
      logger.debug('[AURE Interaction] User archetype not in battle', {
        userId,
        archetypeId: userArchetype.archetypeId,
        battleArchetypes: battle.archetypeIds,
      });
      return { success: false };
    }

    // Update battle scores
    const currentScore = battle.scores[userArchetype.archetypeId] || 0;
    const newScore = currentScore + amount;

    try {
      await prisma.factionBattle.update({
        where: { id: battle.id },
        data: {
          scores: {
            ...battle.scores,
            [userArchetype.archetypeId]: newScore,
          } as any,
        },
      });

      // Create contribution record
      try {
        await prisma.factionContribution.create({
          data: {
            userId,
            archetypeId: userArchetype.archetypeId,
            battleId: battle.id,
            amount,
            source,
          },
        });
      } catch (error: any) {
        // If model doesn't exist yet, log and continue
        if (error.message?.includes('model') || error.message?.includes('FactionContribution')) {
          logger.warn('[AURE Interaction] FactionContribution model not found - Prisma migration required');
        } else {
          throw error;
        }
      }

      logger.info('[AURE Interaction] Faction contribution recorded', {
        userId,
        archetypeId: userArchetype.archetypeId,
        source,
        amount,
        battleId: battle.id,
      });

      return { success: true, battleId: battle.id };
    } catch (error: any) {
      // If model doesn't exist yet, return false
      if (error.message?.includes('model') || error.message?.includes('FactionBattle')) {
        logger.warn('[AURE Interaction] FactionBattle model not found - Prisma migration required');
        return { success: false };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to record faction contribution', { error, userId, source });
    return { success: false };
  }
}

/**
 * Resolve battle and determine winner
 */
export async function resolveBattle(battleId: string): Promise<{
  success: boolean;
  winnerArchetypeId: string | null;
  scores: Record<string, number>;
}> {
  try {
    const battle = await prisma.factionBattle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      throw new Error('Battle not found');
    }

    // Parse scores
    const scores = (battle as any).scores
      ? (typeof (battle as any).scores === 'string'
          ? JSON.parse((battle as any).scores)
          : (battle as any).scores)
      : {};

    // Find winner (highest score)
    let winnerArchetypeId: string | null = null;
    let maxScore = -1;

    Object.entries(scores).forEach(([archetypeId, score]) => {
      const numScore = typeof score === 'number' ? score : 0;
      if (numScore > maxScore) {
        maxScore = numScore;
        winnerArchetypeId = archetypeId;
      }
    });

    // Update battle with winner
    try {
      await prisma.factionBattle.update({
        where: { id: battleId },
        data: {
          winnerArchetypeId,
        },
      });

      logger.info('[AURE Interaction] Battle resolved', {
        battleId,
        winnerArchetypeId,
        scores,
      });

      return {
        success: true,
        winnerArchetypeId,
        scores,
      };
    } catch (error: any) {
      // If model doesn't exist yet, return error
      if (error.message?.includes('model') || error.message?.includes('FactionBattle')) {
        logger.warn('[AURE Interaction] FactionBattle model not found - Prisma migration required');
        return {
          success: false,
          winnerArchetypeId: null,
          scores: {},
        };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to resolve battle', { error, battleId });
    return {
      success: false,
      winnerArchetypeId: null,
      scores: {},
    };
  }
}

/**
 * Get user's contribution for current battle
 */
export async function getUserContribution(userId: string): Promise<{
  archetypeId: string | null;
  totalContribution: number;
  breakdown: Record<string, number>;
}> {
  try {
    const userArchetype = await getUserArchetype(userId);
    if (!userArchetype || !userArchetype.archetypeId) {
      return {
        archetypeId: null,
        totalContribution: 0,
        breakdown: {},
      };
    }

    const battle = await getCurrentBattle();
    if (!battle) {
      return {
        archetypeId: userArchetype.archetypeId,
        totalContribution: 0,
        breakdown: {},
      };
    }

    try {
      const contributions = await prisma.factionContribution.findMany({
        where: {
          userId,
          battleId: battle.id,
        },
      });

      const breakdown: Record<string, number> = {};
      let totalContribution = 0;

      contributions.forEach((contrib) => {
        const source = contrib.source;
        breakdown[source] = (breakdown[source] || 0) + contrib.amount;
        totalContribution += contrib.amount;
      });

      return {
        archetypeId: userArchetype.archetypeId,
        totalContribution,
        breakdown,
      };
    } catch (error: any) {
      // If model doesn't exist yet, return empty
      if (error.message?.includes('model') || error.message?.includes('FactionContribution')) {
        logger.warn('[AURE Interaction] FactionContribution model not found - Prisma migration required');
        return {
          archetypeId: userArchetype.archetypeId,
          totalContribution: 0,
          breakdown: {},
        };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to get user contribution', { error, userId });
    return {
      archetypeId: null,
      totalContribution: 0,
      breakdown: {},
    };
  }
}

