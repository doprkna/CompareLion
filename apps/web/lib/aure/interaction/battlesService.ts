/**
 * AURE Interaction Engine - Faction Battles Service
 * Manages archetype vs archetype battles
 * v0.39.2 - AURE Interaction Engine
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface FactionBattle {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  archetypeA: string;
  archetypeB: string;
  scoreA: number;
  scoreB: number;
}

/**
 * Get current week's faction battle
 * Returns the active battle for this week
 */
export async function getCurrentFactionBattle(): Promise<FactionBattle | null> {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Default archetype pair (placeholder)
    const archetypeA = 'cozy-gremlin';
    const archetypeB = 'minimalist-monk';

    try {
      const battle = await prisma.factionBattle.findFirst({
        where: {
          weekStart: {
            lte: now,
          },
          weekEnd: {
            gte: now,
          },
          archetypeA,
          archetypeB,
        },
      });

      if (battle) {
        return {
          id: battle.id,
          weekStart: battle.weekStart,
          weekEnd: battle.weekEnd,
          archetypeA: battle.archetypeA,
          archetypeB: battle.archetypeB,
          scoreA: battle.scoreA,
          scoreB: battle.scoreB,
        };
      }

      // Create new battle if none exists
      const newBattle = await prisma.factionBattle.create({
        data: {
          weekStart,
          weekEnd,
          archetypeA,
          archetypeB,
          scoreA: 0,
          scoreB: 0,
        },
      });

      return {
        id: newBattle.id,
        weekStart: newBattle.weekStart,
        weekEnd: newBattle.weekEnd,
        archetypeA: newBattle.archetypeA,
        archetypeB: newBattle.archetypeB,
        scoreA: newBattle.scoreA,
        scoreB: newBattle.scoreB,
      };
    } catch (error: any) {
      // If model doesn't exist yet, return placeholder
      if (error.message?.includes('model') || error.message?.includes('FactionBattle')) {
        logger.warn('[AURE Interaction] FactionBattle model not found - Prisma migration required');
        return {
          id: 'placeholder',
          weekStart,
          weekEnd,
          archetypeA,
          archetypeB,
          scoreA: 0,
          scoreB: 0,
        };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to get current faction battle', { error });
    return null;
  }
}

/**
 * Record faction contribution
 * Adds points to archetypeA or archetypeB for current week
 */
export async function recordFactionContribution(
  userId: string,
  archetypeId: string,
  amount: number = 1
): Promise<{ success: boolean }> {
  try {
    const battle = await getCurrentFactionBattle();

    if (!battle) {
      throw new Error('No active faction battle');
    }

    // Determine which side to add to
    const isArchetypeA = battle.archetypeA === archetypeId;
    const isArchetypeB = battle.archetypeB === archetypeId;

    if (!isArchetypeA && !isArchetypeB) {
      throw new Error(`Archetype ${archetypeId} not in current battle`);
    }

    try {
      await prisma.factionBattle.update({
        where: { id: battle.id },
        data: {
          scoreA: isArchetypeA ? { increment: amount } : undefined,
          scoreB: isArchetypeB ? { increment: amount } : undefined,
        },
      });

      logger.info('[AURE Interaction] Faction contribution recorded', {
        userId,
        archetypeId,
        amount,
        battleId: battle.id,
      });

      return { success: true };
    } catch (error: any) {
      // If model doesn't exist yet, return placeholder
      if (error.message?.includes('model') || error.message?.includes('FactionBattle')) {
        logger.warn('[AURE Interaction] FactionBattle model not found - Prisma migration required');
        return { success: false };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to record faction contribution', { error, userId, archetypeId });
    return { success: false };
  }
}

/**
 * Get battle winner
 * Returns the archetype with higher score
 */
export function getBattleWinner(battle: FactionBattle): 'A' | 'B' | 'tie' {
  if (battle.scoreA > battle.scoreB) return 'A';
  if (battle.scoreB > battle.scoreA) return 'B';
  return 'tie';
}

