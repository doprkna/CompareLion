import { prisma } from '@parel/db';

export type NotificationType = 
  | 'story_remix'
  | 'story_sticker'
  | 'story_reaction'
  | 'challenge_entry'
  | string; // Allow custom types

export interface NotificationMetadata {
  [key: string]: any;
}

/**
 * Create a notification for a user
 * @param userId - The user ID to notify
 * @param type - Notification type (e.g., 'story_remix', 'story_sticker')
 * @param metadata - Additional metadata for the notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  metadata?: NotificationMetadata
): Promise<void> {
  try {
    // TODO: connect to real delivery channels (FCM, web push, email, etc.)
    // TODO: Store notification in database once notifications table exists
    
    // For now, log the notification
    console.log('[Notification]', { userId, type, metadata });
    
    // If notifications table exists, uncomment this:
    // await prisma.notification.create({
    //   data: {
    //     userId,
    //     type,
    //     metadata: metadata || {},
    //     read: false,
    //   },
    // });
  } catch (error) {
    console.error('[Notification] Failed to create notification', { userId, type, error });
    // Don't throw - notifications are non-critical
  }
}

/**
 * Get notifications for a user
 * @param userId - The user ID
 * @returns Array of notifications
 */
export async function getUserNotifications(userId: string) {
  try {
    // TODO: fetch from DB once notifications table exists
    // return await prisma.notification.findMany({
    //   where: { userId },
    //   orderBy: { createdAt: 'desc' },
    //   take: 50,
    // });
    return [];
  } catch (error) {
    console.error('[Notification] Failed to get user notifications', { userId, error });
    return [];
  }
}

