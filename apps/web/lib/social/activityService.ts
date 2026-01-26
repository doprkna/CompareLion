/**
 * Activity Service
 * Publish and manage social activities
 * v0.36.42 - Social Systems 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ActivityType, formatActivityDisplay } from './types';

/**
 * Publish a social activity
 * Creates an activity entry for feed generation
 * 
 * @param userId - User ID performing the activity
 * @param type - Activity type
 * @param refId - Optional reference ID (missionId, itemId, etc.)
 * @param metadata - Optional metadata (itemName, level, etc.)
 */
export async function publishActivity(
  userId: string,
  type: ActivityType,
  refId?: string | null,
  metadata?: Record<string, any> | null
): Promise<void> {
  try {
    await prisma.socialActivity.create({
      data: {
        userId,
        type,
        refId: refId || null,
        metadata: metadata || null,
      },
    });

    logger.debug(`[ActivityService] Published activity: ${type} for user ${userId}`);
  } catch (error) {
    // Don't fail if activity publishing fails - it's not critical
    logger.error('[ActivityService] Failed to publish activity', { userId, type, error });
  }
}

/**
 * Get user's recent activities
 * 
 * @param userId - User ID
 * @param limit - Number of activities to return
 * @returns Array of activities
 */
export async function getUserActivities(
  userId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  type: ActivityType;
  refId?: string | null;
  metadata?: Record<string, any> | null;
  timestamp: Date;
  displayText: string;
}>> {
  try {
    const activities = await prisma.socialActivity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return activities.map(activity => ({
      id: activity.id,
      type: activity.type as ActivityType,
      refId: activity.refId,
      metadata: activity.metadata as Record<string, any> | null,
      timestamp: activity.timestamp,
      displayText: formatActivityDisplay(
        {
          id: activity.id,
          userId: activity.userId,
          type: activity.type as ActivityType,
          refId: activity.refId,
          timestamp: activity.timestamp,
          user: activity.user || undefined,
        },
        activity.metadata as Record<string, any> | undefined
      ),
    }));
  } catch (error) {
    logger.error('[ActivityService] Failed to get user activities', { userId, error });
    return [];
  }
}

/**
 * Cleanup old activities (stub for cron)
 * Removes activities older than specified days
 * 
 * @param daysOld - Number of days to keep (default: 30)
 */
export async function cleanupOldActivities(daysOld: number = 30): Promise<{ deleted: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.socialActivity.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    logger.info(`[ActivityService] Cleaned up ${result.count} old activities`);

    return { deleted: result.count };
  } catch (error) {
    logger.error('[ActivityService] Failed to cleanup old activities', error);
    return { deleted: 0 };
  }
}

