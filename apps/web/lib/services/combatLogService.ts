/**
 * Combat Log Service
 * Handles combat event logging and retrieval
 * v0.36.27 - Combat Log 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface LogEventParams {
  userId: string;
  enemyId?: string;
  fightId: string;
  round: number;
  actor: 'player' | 'enemy';
  action: 'attack' | 'block' | 'crit' | 'miss' | 'skill' | 'heal';
  value?: number; // damage/heal
  hpAfter?: number; // target HP after action
}

const MAX_FIGHTS_PER_USER = 30;

/**
 * Log a combat event
 */
export async function logEvent(params: LogEventParams): Promise<void> {
  try {
    await prisma.combatLog.create({
      data: {
        userId: params.userId,
        enemyId: params.enemyId || null,
        fightId: params.fightId,
        round: params.round,
        actor: params.actor,
        action: params.action,
        value: params.value || null,
        hpAfter: params.hpAfter || null,
      },
    });
  } catch (error) {
    logger.error('[CombatLogService] Error logging event', error);
    // Don't throw - logging failures shouldn't break combat
  }
}

/**
 * Get paginated fight logs for a user
 * Returns last 20 fights with their entries
 */
export async function getFightLogs(
  userId: string,
  options: { limit?: number; cursor?: string } = {}
): Promise<{
  fights: Array<{
    fightId: string;
    enemyId: string | null;
    enemyName?: string;
    rounds: number;
    result?: 'WIN' | 'LOSE' | 'DRAW';
    createdAt: Date;
    entries: Array<{
      id: string;
      round: number;
      actor: string;
      action: string;
      value: number | null;
      hpAfter: number | null;
      createdAt: Date;
    }>;
  }>;
  nextCursor: string | null;
}> {
  const limit = options.limit || 20;

  // Get unique fight IDs for this user, ordered by most recent
  const fightIds = await prisma.combatLog.findMany({
    where: { userId },
    select: { fightId: true, createdAt: true },
    distinct: ['fightId'],
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(options.cursor && {
      cursor: { id: options.cursor },
      skip: 1,
    }),
  });

  if (fightIds.length === 0) {
    return { fights: [], nextCursor: null };
  }

  // Get all entries for these fights
  const entries = await prisma.combatLog.findMany({
    where: {
      userId,
      fightId: { in: fightIds.map(f => f.fightId) },
    },
    orderBy: [
      { fightId: 'desc' },
      { round: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  // Group entries by fightId
  const fightsMap = new Map<string, typeof entries>();
  for (const entry of entries) {
    if (!fightsMap.has(entry.fightId)) {
      fightsMap.set(entry.fightId, []);
    }
    fightsMap.get(entry.fightId)!.push(entry);
  }

  // Build response
  const fights = fightIds.map(fight => {
    const fightEntries = fightsMap.get(fight.fightId) || [];
    const rounds = Math.max(...fightEntries.map(e => e.round), 0);
    
    // Try to determine result from last entry
    let result: 'WIN' | 'LOSE' | 'DRAW' | undefined;
    const lastEntry = fightEntries[fightEntries.length - 1];
    if (lastEntry) {
      if (lastEntry.actor === 'player' && lastEntry.hpAfter !== null && lastEntry.hpAfter > 0) {
        result = 'WIN';
      } else if (lastEntry.actor === 'enemy' && lastEntry.hpAfter !== null && lastEntry.hpAfter > 0) {
        result = 'LOSE';
      }
    }

    return {
      fightId: fight.fightId,
      enemyId: fightEntries[0]?.enemyId || null,
      rounds,
      result,
      createdAt: fight.createdAt,
      entries: fightEntries.map(e => ({
        id: e.id,
        round: e.round,
        actor: e.actor,
        action: e.action,
        value: e.value,
        hpAfter: e.hpAfter,
        createdAt: e.createdAt,
      })),
    };
  });

  const nextCursor = fights.length === limit ? fights[fights.length - 1].fightId : null;

  return { fights, nextCursor };
}

/**
 * Get full log for a single fight
 */
export async function getSingleFight(fightId: string, userId: string) {
  const entries = await prisma.combatLog.findMany({
    where: {
      fightId,
      userId, // Ensure user owns this fight
    },
    orderBy: [
      { round: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  if (entries.length === 0) {
    return null;
  }

  const rounds = Math.max(...entries.map(e => e.round), 0);
  
  // Determine result
  let result: 'WIN' | 'LOSE' | 'DRAW' | undefined;
  const lastEntry = entries[entries.length - 1];
  if (lastEntry) {
    if (lastEntry.actor === 'player' && lastEntry.hpAfter !== null && lastEntry.hpAfter > 0) {
      result = 'WIN';
    } else if (lastEntry.actor === 'enemy' && lastEntry.hpAfter !== null && lastEntry.hpAfter > 0) {
      result = 'LOSE';
    }
  }

  return {
    fightId,
    enemyId: entries[0]?.enemyId || null,
    rounds,
    result,
    createdAt: entries[0]?.createdAt || new Date(),
    entries: entries.map(e => ({
      id: e.id,
      round: e.round,
      actor: e.actor,
      action: e.action,
      value: e.value,
      hpAfter: e.hpAfter,
      createdAt: e.createdAt,
    })),
  };
}

/**
 * Trim old fights - keep max 30 fights per user
 */
export async function trimOldFights(userId: string): Promise<number> {
  try {
    // Get fight IDs ordered by creation (oldest first)
    const fightIds = await prisma.combatLog.findMany({
      where: { userId },
      select: { fightId: true, createdAt: true },
      distinct: ['fightId'],
      orderBy: { createdAt: 'asc' },
    });

    if (fightIds.length <= MAX_FIGHTS_PER_USER) {
      return 0;
    }

    // Get fight IDs to delete (oldest ones)
    const fightsToDelete = fightIds
      .slice(0, fightIds.length - MAX_FIGHTS_PER_USER)
      .map(f => f.fightId);

    // Delete entries for old fights
    const result = await prisma.combatLog.deleteMany({
      where: {
        userId,
        fightId: { in: fightsToDelete },
      },
    });

    logger.info(`[CombatLogService] Trimmed ${result.count} log entries for user ${userId}`);
    return result.count;
  } catch (error) {
    logger.error('[CombatLogService] Error trimming old fights', error);
    return 0;
  }
}

