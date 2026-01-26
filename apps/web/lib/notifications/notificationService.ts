/**
 * Notification Service
 * Handle in-app notifications for story-related events
 * v0.40.17 - Story Notifications 1.0 (In-App Alerts)
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export type NotificationType =
  | 'story_reaction'
  | 'story_sticker'
  | 'story_remix'
  | 'challenge_entry'
  | 'challenge_end'
  | 'weekly_story_ready';

export interface NotificationData {
  storyId?: string;
  remixId?: string;
  challengeId?: string;
  reactionType?: string;
  stickerId?: string;
  [key: string]: any; // Allow additional fields
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  data: NotificationData;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  data: NotificationData
): Promise<Notification> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        data: data as any,
        isRead: false,
      },
    });

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type as NotificationType,
      data: notification.data as NotificationData,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  } catch (error) {
    logger.error('[Notification] Failed to create notification', { error, userId, type, data });
    throw error;
  }
}

/**
 * Get notifications for a user
 * Returns unread + last 50 read notifications
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { isRead: 'asc' }, // Unread first
        { createdAt: 'desc' }, // Then by date
      ],
      take: 100, // Limit to 100 total
    });

    return notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type as NotificationType,
      data: n.data as NotificationData,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  } catch (error) {
    logger.error('[Notification] Failed to get notifications', { error, userId });
    return [];
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    logger.error('[Notification] Failed to get unread count', { error, userId });
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    logger.error('[Notification] Failed to mark notification as read', {
      error,
      notificationId,
      userId,
    });
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    logger.error('[Notification] Failed to mark all notifications as read', { error, userId });
    throw error;
  }
}

