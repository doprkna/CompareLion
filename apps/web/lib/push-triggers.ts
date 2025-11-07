/**
 * Push notification triggers (v0.21.0)
 * Server-side helpers for triggering push notifications
 */

import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

/**
 * Send push notification to user
 * This is a placeholder - requires web-push library and VAPID keys
 */
async function sendPushToUser(userId: string, payload: NotificationPayload) {
  // TODO: Implement actual push sending with web-push
  // For now, just log
  logger.debug('[Push] Would send push notification', { userId, payload });
  
  // In production, you would:
  // 1. Get user's push subscription from database
  // 2. Use web-push library to send notification
  // 3. Handle errors and expired subscriptions
}

/**
 * Trigger: New message received
 */
export async function triggerNewMessageNotification(
  recipientId: string,
  senderName: string,
  messagePreview: string
) {
  await sendPushToUser(recipientId, {
    title: `New message from ${senderName}`,
    body: messagePreview,
    url: '/friends',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'message',
      senderId: recipientId,
    },
  });
}

/**
 * Trigger: New comment on user's content
 */
export async function triggerNewCommentNotification(
  userId: string,
  commenterName: string,
  contentType: 'reflection' | 'post',
  commentPreview: string
) {
  await sendPushToUser(userId, {
    title: `${commenterName} commented on your ${contentType}`,
    body: commentPreview,
    url: '/profile',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'comment',
      contentType,
    },
  });
}

/**
 * Trigger: New reaction received
 */
export async function triggerNewReactionNotification(
  userId: string,
  reactorName: string,
  reactionType: string,
  contentType: string
) {
  await sendPushToUser(userId, {
    title: `${reactorName} reacted to your ${contentType}`,
    body: `Received a ${reactionType} reaction`,
    url: '/profile',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'reaction',
      reactionType,
    },
  });
}

/**
 * Trigger: Weekly reflection summary
 */
export async function triggerWeeklyReflectionNotification(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    await sendPushToUser(userId, {
      title: '📊 Your Weekly Reflection',
      body: `Time to reflect on your week, ${user?.name || 'Explorer'}!`,
      url: '/reflection',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        type: 'weekly-reflection',
      },
    });
  } catch (error) {
    logger.error('[Push] Weekly reflection notification failed', error);
  }
}

/**
 * Trigger: Achievement unlocked
 */
export async function triggerAchievementNotification(
  userId: string,
  achievementName: string,
  achievementDescription: string
) {
  await sendPushToUser(userId, {
    title: `🏆 Achievement Unlocked!`,
    body: `${achievementName}: ${achievementDescription}`,
    url: '/profile',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'achievement',
      achievementName,
    },
  });
}

/**
 * Trigger: Level up notification
 */
export async function triggerLevelUpNotification(
  userId: string,
  newLevel: number
) {
  await sendPushToUser(userId, {
    title: '🎉 Level Up!',
    body: `You've reached Level ${newLevel}! Keep growing! 🦁`,
    url: '/profile',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'level-up',
      level: newLevel,
    },
  });
}

/**
 * Trigger: Daily reminder
 */
export async function triggerDailyReminderNotification(userId: string) {
  await sendPushToUser(userId, {
    title: '🌟 Daily Check-in',
    body: 'Start your day with a quick flow session!',
    url: '/flow',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'daily-reminder',
    },
  });
}

/**
 * Trigger: Friend request received
 */
export async function triggerFriendRequestNotification(
  userId: string,
  requesterName: string
) {
  await sendPushToUser(userId, {
    title: '👥 New Friend Request',
    body: `${requesterName} wants to connect with you`,
    url: '/friends',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      type: 'friend-request',
    },
  });
}

/**
 * Batch send notifications (for admin broadcasts)
 */
export async function sendBroadcastNotification(
  userIds: string[],
  payload: NotificationPayload
) {
  logger.info('[Push] Broadcasting notification', { userCount: userIds.length });
  
  // Send in batches to avoid overwhelming the system
  const batchSize = 100;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    await Promise.all(batch.map(userId => sendPushToUser(userId, payload)));
  }
}

