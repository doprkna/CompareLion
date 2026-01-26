/**
 * Event Engine
 * Event activation, deactivation, and wildcard generation
 * v0.36.41 - Events System 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { EventType, EventEffectType, EffectTarget } from './types';

/**
 * Activate an event
 * Sets active flag to true
 */
export async function activateEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { active: true },
    });

    logger.info(`[EventEngine] Activated event: ${event.name} (${eventId})`);

    return { success: true };
  } catch (error) {
    logger.error('[EventEngine] Failed to activate event', { eventId, error });
    return { success: false, error: 'Failed to activate event' };
  }
}

/**
 * Deactivate an event
 * Sets active flag to false
 */
export async function deactivateEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { active: false },
    });

    logger.info(`[EventEngine] Deactivated event: ${event.name} (${eventId})`);

    return { success: true };
  } catch (error) {
    logger.error('[EventEngine] Failed to deactivate event', { eventId, error });
    return { success: false, error: 'Failed to deactivate event' };
  }
}

/**
 * Get current active events
 */
export async function getCurrentActiveEvents() {
  try {
    const now = new Date();

    const events = await prisma.event.findMany({
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

    return events;
  } catch (error) {
    logger.error('[EventEngine] Failed to get active events', error);
    return [];
  }
}

/**
 * Log user participation in an event
 */
export async function logEventParticipation(
  userId: string,
  eventId: string
): Promise<void> {
  try {
    await prisma.eventLog.create({
      data: {
        userId,
        eventId,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    // Don't fail if logging fails - it's not critical
    logger.debug('[EventEngine] Failed to log event participation', { userId, eventId, error });
  }
}

/**
 * Generate a wildcard random event
 * This is a stub - generates a random event with random effects
 * 
 * TODO: Implement proper wildcard event generation logic
 * - Random event templates
 * - Weighted effect selection
 * - Duration randomization
 * - Effect value randomization
 */
export async function generateWildcardEvent(): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // Stub implementation - creates a simple random event
    const wildcardTemplates = [
      {
        name: 'Double XP Weekend',
        description: 'All players receive double XP!',
        effectType: EventEffectType.XP_MULTIPLIER,
        value: 2.0,
      },
      {
        name: 'Gold Rush',
        description: 'Increased gold rewards!',
        effectType: EventEffectType.GOLD_MULTIPLIER,
        value: 1.5,
      },
      {
        name: 'Lucky Day',
        description: 'Increased drop rates!',
        effectType: EventEffectType.DROP_BOOST,
        value: 0.2, // +20% drop rate
      },
      {
        name: 'Power Surge',
        description: 'Increased damage!',
        effectType: EventEffectType.DAMAGE_BUFF,
        value: 1.25, // +25% damage
      },
    ];

    const template = wildcardTemplates[Math.floor(Math.random() * wildcardTemplates.length)];
    
    // Create event for 24 hours
    const startAt = new Date();
    const endAt = new Date();
    endAt.setHours(endAt.getHours() + 24);

    const event = await prisma.event.create({
      data: {
        name: template.name,
        description: template.description,
        type: EventType.WILDCARD,
        startAt,
        endAt,
        active: true,
        emoji: '🎲',
      },
    });

    // Create effect
    await prisma.eventEffect.create({
      data: {
        eventId: event.id,
        effectType: template.effectType,
        value: template.value,
        target: EffectTarget.GLOBAL,
        description: template.description,
      },
    });

    logger.info(`[EventEngine] Generated wildcard event: ${event.name} (${event.id})`);

    return { success: true, eventId: event.id };
  } catch (error) {
    logger.error('[EventEngine] Failed to generate wildcard event', error);
    return { success: false, error: 'Failed to generate wildcard event' };
  }
}

/**
 * Check and auto-deactivate expired events
 * This is a stub for cron job - call this periodically
 * 
 * TODO: Set up cron job to call this function
 * Example: cron.schedule('0 * * * *', checkExpiredEvents) // Every hour
 */
export async function checkExpiredEvents(): Promise<{ deactivated: number }> {
  try {
    const now = new Date();

    const expiredEvents = await prisma.event.findMany({
      where: {
        active: true,
        endAt: { lt: now },
      },
    });

    let deactivated = 0;

    for (const event of expiredEvents) {
      await prisma.event.update({
        where: { id: event.id },
        data: { active: false },
      });
      deactivated++;
    }

    if (deactivated > 0) {
      logger.info(`[EventEngine] Auto-deactivated ${deactivated} expired events`);
    }

    return { deactivated };
  } catch (error) {
    logger.error('[EventEngine] Failed to check expired events', error);
    return { deactivated: 0 };
  }
}

