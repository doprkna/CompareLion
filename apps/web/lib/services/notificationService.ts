/**
 * Notification Service
 * Creates and manages notifications
 * v0.36.26 - Notifications 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export type NotificationType =
  | 'achievement'
  | 'fight'
  | 'quest'
  | 'system'
  | 'loot'
  | 'levelup'
  | 'social';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  refId?: string;
}

const MAX_NOTIFICATIONS_PER_USER = 300;
const RETENTION_DAYS = 90;

/**
 * Create a notification and auto-cleanup old ones
 */
export async function createNotification(params: CreateNotificationParams): Promise<string> {
  try {
    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body || null,
        refId: params.refId || null,
        isRead: false,
      },
    });

    // Auto-cleanup: Keep max 300 per user
    await cleanupOldNotifications(params.userId);

    logger.debug(`[NotificationService] Created ${params.type} notification for user ${params.userId}`);
    return notification.id;
  } catch (error) {
    logger.error('[NotificationService] Failed to create notification', { params, error });
    throw error;
  }
}

/**
 * Cleanup old notifications (max 300 per user, 90 day retention)
 */
async function cleanupOldNotifications(userId: string): Promise<void> {
  try {
    // Count total notifications
    const count = await prisma.notification.count({
      where: { userId },
    });

    if (count <= MAX_NOTIFICATIONS_PER_USER) {
      return; // No cleanup needed
    }

    // Calculate cutoff date (90 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

    // Delete oldest notifications beyond limit or retention period
    const toDelete = count - MAX_NOTIFICATIONS_PER_USER;

    // Get oldest notifications beyond limit
    const oldNotifications = await prisma.notification.findMany({
      where: {
        userId,
        OR: [
          { createdAt: { lt: cutoffDate } }, // Older than 90 days
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: toDelete,
      select: { id: true },
    });

    if (oldNotifications.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          id: { in: oldNotifications.map((n) => n.id) },
        },
      });
      logger.debug(`[NotificationService] Cleaned up ${oldNotifications.length} old notifications for user ${userId}`);
    }

    // If still over limit after retention cleanup, delete oldest
    const remainingCount = await prisma.notification.count({
      where: { userId },
    });

    if (remainingCount > MAX_NOTIFICATIONS_PER_USER) {
      const excess = remainingCount - MAX_NOTIFICATIONS_PER_USER;
      const excessNotifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: excess,
        select: { id: true },
      });

      await prisma.notification.deleteMany({
        where: {
          id: { in: excessNotifications.map((n) => n.id) },
        },
      });
      logger.debug(`[NotificationService] Cleaned up ${excess} excess notifications for user ${userId}`);
    }
  } catch (error) {
    logger.error('[NotificationService] Failed to cleanup notifications', { userId, error });
    // Don't throw - cleanup failures shouldn't break notification creation
  }
}

/**
 * Notification creation helpers
 */

export async function notifyAchievementUnlocked(
  userId: string,
  achievementTitle: string,
  achievementId?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'achievement',
    title: 'Achievement Unlocked!',
    body: achievementTitle,
    refId: achievementId,
  });
}

export async function notifyFightResult(
  userId: string,
  won: boolean,
  enemyName: string,
  fightId?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'fight',
    title: 'Arena Result',
    body: won ? `Victory vs ${enemyName}` : `Defeat against ${enemyName}`,
    refId: fightId,
  });
}

export async function notifyQuestionAnswered(
  userId: string,
  category?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'quest',
    title: 'Daily Progress',
    body: category ? `You answered a question in ${category}` : 'You answered a question',
  });
}

export async function notifyLevelUp(userId: string, newLevel: number): Promise<void> {
  await createNotification({
    userId,
    type: 'levelup',
    title: 'Level Up!',
    body: `You reached Level ${newLevel}.`,
  });
}

export async function notifyLootDrop(
  userId: string,
  itemName: string,
  rarity: string,
  itemId?: string
): Promise<void> {
  await createNotification({
    userId,
    type: 'loot',
    title: 'New Item Found',
    body: `${itemName} (${rarity})`,
    refId: itemId,
  });
}

export async function notifySystemMessage(userId: string, message: string): Promise<void> {
  await createNotification({
    userId,
    type: 'system',
    title: 'System Update',
    body: message,
  });
}

export async function notifySocialInteraction(
  userId: string,
  interactionType: 'comment' | 'reaction' | 'mention',
  username: string,
  refId?: string
): Promise<void> {
  let body = '';
  if (interactionType === 'comment') {
    body = `${username} commented on your post`;
  } else if (interactionType === 'reaction') {
    body = `${username} reacted to your post`;
  } else if (interactionType === 'mention') {
    body = `${username} mentioned you`;
  }

  await createNotification({
    userId,
    type: 'social',
    title: 'New Interaction',
    body,
    refId,
  });
}

/**
 * Pet/Companion notifications (v0.36.32)
 */
export async function notifyPetUnlocked(userId: string, petName: string): Promise<void> {
  await createNotification({
    userId,
    type: 'loot',
    title: 'New Companion!',
    body: `You unlocked ${petName}.`,
  });
}

export async function notifyPetLevelUp(userId: string, userPetId: string, newLevel: number): Promise<void> {
  await createNotification({
    userId,
    type: 'levelup',
    title: 'Your companion leveled up!',
    body: `Reached Level ${newLevel}.`,
    refId: userPetId,
  });
}

export async function notifyPetEquipped(userId: string, petName: string): Promise<void> {
  await createNotification({
    userId,
    type: 'system',
    title: 'Companion Equipped',
    body: `${petName} is now your active companion.`,
  });
}

