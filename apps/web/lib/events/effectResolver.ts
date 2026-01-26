/**
 * Event Effect Resolver
 * Resolves and applies event effects to game systems
 * v0.36.41 - Events System 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { EventEffectType, ResolvedEventEffects, EffectTarget } from './types';

/**
 * Default resolved effects (no modifiers)
 */
const DEFAULT_EFFECTS: ResolvedEventEffects = {
  xpMultiplier: 1.0,
  goldMultiplier: 1.0,
  dropBoost: 0.0,
  damageBuff: 1.0,
  damageNerf: 1.0,
  challengeBonus: 0.0,
};

/**
 * Resolve event effects for active events
 * Combines all active event effects into a single resolved set
 * 
 * @param userId - Optional user ID for user-specific effects
 * @returns Resolved event effects
 */
export async function resolveEventEffects(userId?: string): Promise<ResolvedEventEffects> {
  try {
    const now = new Date();

    // Get all active events
    const activeEvents = await prisma.event.findMany({
      where: {
        active: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      include: {
        effects: true,
      },
    });

    if (activeEvents.length === 0) {
      return DEFAULT_EFFECTS;
    }

    // Initialize resolved effects
    const resolved: ResolvedEventEffects = { ...DEFAULT_EFFECTS };

    // Process all effects from active events
    for (const event of activeEvents) {
      for (const effect of event.effects) {
        // Filter by target scope
        if (effect.target === EffectTarget.USER && !userId) {
          continue; // Skip user-specific effects if no userId provided
        }

        // Apply effect based on type
        switch (effect.effectType) {
          case EventEffectType.XP_MULTIPLIER:
            // Multiplicative: multiply values
            resolved.xpMultiplier *= effect.value;
            break;

          case EventEffectType.GOLD_MULTIPLIER:
            // Multiplicative: multiply values
            resolved.goldMultiplier *= effect.value;
            break;

          case EventEffectType.DROP_BOOST:
            // Additive: add percentages
            resolved.dropBoost += effect.value;
            break;

          case EventEffectType.DAMAGE_BUFF:
            // Multiplicative: multiply damage
            resolved.damageBuff *= effect.value;
            break;

          case EventEffectType.DAMAGE_NERF:
            // Multiplicative: reduce damage (value should be < 1.0)
            resolved.damageNerf *= effect.value;
            break;

          case EventEffectType.CHALLENGE_BONUS:
            // Additive: add bonus points
            resolved.challengeBonus += effect.value;
            break;

          default:
            logger.warn(`[EffectResolver] Unknown effect type: ${effect.effectType}`);
        }
      }
    }

    // Ensure multipliers are at least 1.0 (no negative effects from multiplication)
    resolved.xpMultiplier = Math.max(1.0, resolved.xpMultiplier);
    resolved.goldMultiplier = Math.max(1.0, resolved.goldMultiplier);
    resolved.damageBuff = Math.max(1.0, resolved.damageBuff);
    resolved.damageNerf = Math.max(0.1, Math.min(1.0, resolved.damageNerf)); // Clamp between 0.1 and 1.0

    return resolved;
  } catch (error) {
    logger.error('[EffectResolver] Failed to resolve event effects', error);
    return DEFAULT_EFFECTS; // Return defaults on error - never break gameplay
  }
}

/**
 * Apply XP multiplier to base XP
 */
export function applyXPMultiplier(baseXP: number, multiplier: number): number {
  return Math.floor(baseXP * multiplier);
}

/**
 * Apply gold multiplier to base gold
 */
export function applyGoldMultiplier(baseGold: number, multiplier: number): number {
  return Math.floor(baseGold * multiplier);
}

/**
 * Apply drop boost to base drop rate
 */
export function applyDropBoost(baseDropRate: number, boost: number): number {
  return Math.min(1.0, baseDropRate + boost); // Cap at 100%
}

/**
 * Apply damage buff/nerf to base damage
 */
export function applyDamageModifiers(baseDamage: number, buff: number, nerf: number): number {
  const buffed = baseDamage * buff;
  const nerfed = buffed * nerf;
  return Math.floor(nerfed);
}

/**
 * Apply challenge bonus to base score
 */
export function applyChallengeBonus(baseScore: number, bonus: number): number {
  return baseScore + Math.floor(bonus);
}

/**
 * Get active events with resolved effects
 * Convenience function for API responses
 */
export async function getActiveEventsWithEffects(userId?: string) {
  try {
    const now = new Date();

    const activeEvents = await prisma.event.findMany({
      where: {
        active: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      include: {
        effects: true,
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    const resolvedEffects = await resolveEventEffects(userId);

    return {
      events: activeEvents.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        startAt: event.startAt,
        endAt: event.endAt,
        icon: event.icon,
        emoji: event.emoji,
        effects: event.effects,
      })),
      resolvedEffects,
    };
  } catch (error) {
    logger.error('[EffectResolver] Failed to get active events', error);
    return {
      events: [],
      resolvedEffects: DEFAULT_EFFECTS,
    };
  }
}

