/**
 * RPG Event Engine
 * Unified event system for global modifiers
 * v0.36.15 - Event System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ComputedStats } from './stats';

export interface EventEffect {
  // Hero modifiers
  atkMultiplier?: number;
  defMultiplier?: number;
  hpMultiplier?: number;
  critBonus?: number; // Additive percentage
  speedBonus?: number; // Additive
  
  // Reward modifiers
  xpBonus?: number; // Percentage (e.g., 0.2 = +20%)
  goldBonus?: number; // Percentage
  
  // Enemy modifiers
  enemyAtkMultiplier?: number;
  enemyHpMultiplier?: number;
}

export interface RpgEvent {
  id: string;
  code: string;
  name: string;
  description: string | null;
  effect: EventEffect;
  startsAt: Date;
  endsAt: Date;
  active: boolean;
}

/**
 * Get all active events at a given time
 * Returns empty array if no events or on error
 */
export async function getActiveEvents(now: Date = new Date()): Promise<RpgEvent[]> {
  try {
    const events = await prisma.rpgEvent.findMany({
      where: {
        active: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    // Parse effect JSON safely
    return events.map(event => ({
      id: event.id,
      code: event.code,
      name: event.name,
      description: event.description,
      effect: (typeof event.effect === 'string' 
        ? JSON.parse(event.effect) 
        : event.effect) as EventEffect,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      active: event.active,
    })).filter(event => {
      // Skip events with malformed effect JSON
      if (!event.effect || typeof event.effect !== 'object') {
        logger.warn(`[EventEngine] Skipping event ${event.code} - malformed effect JSON`);
        return false;
      }
      return true;
    });
  } catch (error) {
    logger.error('[EventEngine] Error fetching active events', error);
    return []; // Return empty array on error - never break gameplay
  }
}

/**
 * Apply event effects to hero stats
 * Multiplies multipliers, adds bonuses
 */
export function applyEventsToHero(
  baseStats: ComputedStats,
  events: RpgEvent[]
): ComputedStats {
  if (events.length === 0) {
    return baseStats; // No events = no changes
  }

  // Collect all multipliers and bonuses
  const multipliers = {
    atk: 1.0,
    def: 1.0,
    hp: 1.0,
  };
  
  const bonuses = {
    crit: 0,
    speed: 0,
  };

  for (const event of events) {
    const effect = event.effect;
    
    // Apply multipliers (multiplicative stacking)
    if (effect.atkMultiplier) {
      multipliers.atk *= effect.atkMultiplier;
    }
    if (effect.defMultiplier) {
      multipliers.def *= effect.defMultiplier;
    }
    if (effect.hpMultiplier) {
      multipliers.hp *= effect.hpMultiplier;
    }
    
    // Apply bonuses (additive stacking)
    if (effect.critBonus) {
      bonuses.crit += effect.critBonus;
    }
    if (effect.speedBonus) {
      bonuses.speed += effect.speedBonus;
    }
  }

  // Apply to stats
  return {
    ...baseStats,
    attackPower: Math.floor(baseStats.attackPower * multipliers.atk),
    defense: Math.floor(baseStats.defense * multipliers.def),
    maxHp: Math.floor(baseStats.maxHp * multipliers.hp),
    critChance: Math.min(100, baseStats.critChance + bonuses.crit), // Cap at 100%
    speed: Math.max(1, baseStats.speed + bonuses.speed), // Minimum 1
  };
}

/**
 * Apply event effects to rewards
 * Multiplies XP and gold by (1 + bonus%)
 */
export function applyEventsToRewards(
  rewards: { xp: number; gold: number },
  events: RpgEvent[]
): { xp: number; gold: number } {
  if (events.length === 0) {
    return rewards; // No events = no changes
  }

  let xpMultiplier = 1.0;
  let goldMultiplier = 1.0;

  for (const event of events) {
    const effect = event.effect;
    
    if (effect.xpBonus) {
      xpMultiplier *= (1 + effect.xpBonus);
    }
    if (effect.goldBonus) {
      goldMultiplier *= (1 + effect.goldBonus);
    }
  }

  return {
    xp: Math.floor(rewards.xp * xpMultiplier),
    gold: Math.floor(rewards.gold * goldMultiplier),
  };
}

/**
 * Apply event effects to enemy stats
 * Only applies if event has enemy modifiers
 */
export function applyEventsToEnemy(
  enemyStats: { hp: number; atk: number; def?: number },
  events: RpgEvent[]
): { hp: number; atk: number; def?: number } {
  if (events.length === 0) {
    return enemyStats; // No events = no changes
  }

  let hpMultiplier = 1.0;
  let atkMultiplier = 1.0;

  for (const event of events) {
    const effect = event.effect;
    
    if (effect.enemyHpMultiplier) {
      hpMultiplier *= effect.enemyHpMultiplier;
    }
    if (effect.enemyAtkMultiplier) {
      atkMultiplier *= effect.enemyAtkMultiplier;
    }
  }

  return {
    ...enemyStats,
    hp: Math.floor(enemyStats.hp * hpMultiplier),
    atk: Math.floor(enemyStats.atk * atkMultiplier),
    def: enemyStats.def ? Math.floor(enemyStats.def * 1.0) : undefined, // No def modifier for now
  };
}

