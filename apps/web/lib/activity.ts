/**
 * Activity Logging System
 * 
 * Centralized utility for tracking user activities across the app.
 * All activities are stored in the database for the user feed.
 */

import { prisma } from "@/lib/db";

export type ActivityType = 
  | "xp"
  | "message"
  | "flow"
  | "achievement"
  | "level_up"
  | "purchase"
  | "streak"
  | "login";

interface ActivityMetadata {
  amount?: number;
  recipient?: string;
  achievementCode?: string;
  level?: number;
  [key: string]: any;
}

/**
 * Log an activity to the user's feed
 * @param userId User ID
 * @param type Activity type
 * @param title Activity title (brief description)
 * @param description Optional detailed description
 * @param metadata Optional additional data
 */
export async function logActivity(
  userId: string,
  type: ActivityType,
  title: string,
  description?: string,
  metadata?: ActivityMetadata
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type,
        title,
        description: description || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error("[Activity] Failed to log activity:", error);
    // Don't throw - activity logging shouldn't break main flow
  }
}

/**
 * Helper: Log XP gain
 */
export async function logXpGain(userId: string, amount: number, source: string) {
  await logActivity(
    userId,
    "xp",
    `Earned ${amount} XP`,
    `From: ${source}`,
    { amount, source }
  );
}

/**
 * Helper: Log message sent
 */
export async function logMessageSent(userId: string, recipientEmail: string) {
  await logActivity(
    userId,
    "message",
    "Message Sent",
    `To: ${recipientEmail}`,
    { recipient: recipientEmail }
  );
}

/**
 * Helper: Log flow completion
 */
export async function logFlowComplete(userId: string, questionsAnswered: number) {
  await logActivity(
    userId,
    "flow",
    "Flow Completed",
    `Answered ${questionsAnswered} questions`,
    { questionsAnswered }
  );
}

/**
 * Helper: Log achievement unlock
 */
export async function logAchievementUnlock(
  userId: string,
  achievementTitle: string,
  achievementCode: string,
  xpReward: number
) {
  await logActivity(
    userId,
    "achievement",
    `Achievement Unlocked: ${achievementTitle}`,
    `Earned ${xpReward} XP`,
    { achievementCode, xpReward }
  );
}

/**
 * Helper: Log level up
 */
export async function logLevelUp(userId: string, newLevel: number) {
  await logActivity(
    userId,
    "level_up",
    `Level Up! Reached Level ${newLevel}`,
    `Congratulations on your progress!`,
    { level: newLevel }
  );
}

/**
 * Helper: Log purchase
 */
export async function logPurchase(
  userId: string,
  itemName: string,
  cost: number,
  currency: "funds" | "diamonds"
) {
  await logActivity(
    userId,
    "purchase",
    `Purchased ${itemName}`,
    `Spent ${cost} ${currency}`,
    { itemName, cost, currency }
  );
}

/**
 * Helper: Log streak milestone
 */
export async function logStreakMilestone(userId: string, streakDays: number) {
  await logActivity(
    userId,
    "streak",
    `${streakDays}-Day Streak! 🔥`,
    `Keep the momentum going!`,
    { streakDays }
  );
}

/**
 * Helper: Log login
 */
export async function logLogin(userId: string) {
  await logActivity(
    userId,
    "login",
    "Logged In",
    "Welcome back!",
    { timestamp: new Date().toISOString() }
  );
}











