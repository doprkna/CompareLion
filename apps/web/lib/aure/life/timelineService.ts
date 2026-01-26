/**
 * AURE Life Engine - Timeline Service
 * Records and retrieves timeline events for users
 * v0.39.1 - AURE Life Engine
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export type TimelineEventType = 'rating' | 'challenge' | 'vs' | 'quest' | 'assist';

export interface TimelineEventData {
  userId: string;
  type: TimelineEventType;
  referenceId?: string | null;
  category?: string | null;
}

export interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  referenceId: string | null;
  category: string | null;
  createdAt: Date;
}

/**
 * Record a timeline event
 * Called when AURE events occur (rating completed, VS ended, challenge submitted, etc.)
 */
export async function recordTimelineEvent(data: TimelineEventData): Promise<TimelineEvent> {
  try {
    // NOTE: This requires Prisma schema migration for TimelineEvent model
    // For now, this is a stub that will work once the model exists
    
    const event = await prisma.timelineEvent.create({
      data: {
        userId: data.userId,
        type: data.type,
        referenceId: data.referenceId || null,
        category: data.category || null,
      },
    });

    logger.info('[AURE Life] Timeline event recorded', {
      eventId: event.id,
      userId: data.userId,
      type: data.type,
    });

    return event;
  } catch (error: any) {
    // If model doesn't exist yet, log and return placeholder
    if (error.message?.includes('model') || error.message?.includes('TimelineEvent')) {
      logger.warn('[AURE Life] TimelineEvent model not found - Prisma migration required', {
        userId: data.userId,
        type: data.type,
      });
      // Return placeholder structure
      return {
        id: 'placeholder',
        userId: data.userId,
        type: data.type,
        referenceId: data.referenceId || null,
        category: data.category || null,
        createdAt: new Date(),
      };
    }
    logger.error('[AURE Life] Failed to record timeline event', { error, data });
    throw error;
  }
}

/**
 * Get timeline events for a user
 */
export async function getUserTimeline(
  userId: string,
  limit: number = 50
): Promise<TimelineEvent[]> {
  try {
    const events = await prisma.timelineEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return events;
  } catch (error: any) {
    // If model doesn't exist yet, return empty array
    if (error.message?.includes('model') || error.message?.includes('TimelineEvent')) {
      logger.warn('[AURE Life] TimelineEvent model not found - Prisma migration required');
      return [];
    }
    logger.error('[AURE Life] Failed to get user timeline', { error, userId });
    throw error;
  }
}

/**
 * Get timeline events for archetype detection (last 30-60 events)
 */
export async function getTimelineForArchetype(userId: string, limit: number = 60): Promise<TimelineEvent[]> {
  return getUserTimeline(userId, limit);
}

/**
 * Get timeline events for weekly vibe (last 7 days)
 */
export async function getTimelineForWeeklyVibe(userId: string): Promise<TimelineEvent[]> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const events = await prisma.timelineEvent.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return events;
  } catch (error: any) {
    // If model doesn't exist yet, return empty array
    if (error.message?.includes('model') || error.message?.includes('TimelineEvent')) {
      logger.warn('[AURE Life] TimelineEvent model not found - Prisma migration required');
      return [];
    }
    logger.error('[AURE Life] Failed to get weekly timeline', { error, userId });
    throw error;
  }
}

