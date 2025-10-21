/**
 * Notification System Helper
 * 
 * Creates persistent notifications and broadcasts them to connected clients.
 * Includes simple rate limiting to prevent spam.
 */

import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";

// In-memory cache to prevent duplicate notifications within 5 seconds
const recentNotifications = new Map<string, number>();
const DUPLICATE_THRESHOLD_MS = 5000;

/**
 * Create a notification for a user
 * 
 * @param userId User ID to notify
 * @param type Notification type (message, xp, achievement, system)
 * @param title Notification title
 * @param body Optional notification body
 * @returns Created notification or null if duplicate detected
 */
export async function notify(
  userId: string,
  type: string,
  title: string,
  body?: string
): Promise<any | null> {
  try {
    // Check for duplicate notifications
    const key = `${userId}:${type}:${title}`;
    const lastSent = recentNotifications.get(key);
    const now = Date.now();

    if (lastSent && (now - lastSent) < DUPLICATE_THRESHOLD_MS) {
      console.log(`[Notify] Skipping duplicate notification: ${title}`);
      return null;
    }

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body: body || null,
      },
    });

    // Update cache
    recentNotifications.set(key, now);

    // Clean up old cache entries (every 100 notifications)
    if (recentNotifications.size > 100) {
      const cutoff = now - DUPLICATE_THRESHOLD_MS;
      for (const [key, timestamp] of recentNotifications.entries()) {
        if (timestamp < cutoff) {
          recentNotifications.delete(key);
        }
      }
    }

    // Broadcast event
    await publishEvent("notification:new", {
      userId,
      id: notification.id,
      type,
      title,
      body,
      createdAt: notification.createdAt,
    });

    console.log(`[Notify] Created: ${title} for user ${userId}`);
    return notification;

  } catch (error) {
    console.error("[Notify] Failed to create notification:", error);
    return null;
  }
}

/**
 * Helper: Notify XP gain
 */
export async function notifyXpGain(userId: string, amount: number, source: string) {
  return await notify(
    userId,
    "xp",
    `+${amount} XP`,
    `Earned from: ${source}`
  );
}

/**
 * Helper: Notify new message
 */
export async function notifyMessage(userId: string, fromEmail: string, preview: string) {
  return await notify(
    userId,
    "message",
    `New message from ${fromEmail}`,
    preview.slice(0, 100)
  );
}

/**
 * Helper: Notify achievement unlock
 */
export async function notifyAchievement(userId: string, achievementTitle: string, xpReward: number) {
  return await notify(
    userId,
    "achievement",
    `Achievement Unlocked: ${achievementTitle}`,
    `+${xpReward} XP`
  );
}

/**
 * Helper: Notify system message
 */
export async function notifySystem(userId: string, title: string, body?: string) {
  return await notify(userId, "system", title, body);
}











