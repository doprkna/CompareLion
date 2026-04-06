/**
 * Push notification triggers (v0.21.0)
 * Server-side helpers for triggering push notifications
 */
interface NotificationPayload {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
    data?: Record<string, any>;
}
/**
 * Trigger: New message received
 */
export declare function triggerNewMessageNotification(recipientId: string, senderName: string, messagePreview: string): Promise<void>;
/**
 * Trigger: New comment on user's content
 */
export declare function triggerNewCommentNotification(userId: string, commenterName: string, contentType: 'reflection' | 'post', commentPreview: string): Promise<void>;
/**
 * Trigger: New reaction received
 */
export declare function triggerNewReactionNotification(userId: string, reactorName: string, reactionType: string, contentType: string): Promise<void>;
/**
 * Trigger: Weekly reflection summary
 */
export declare function triggerWeeklyReflectionNotification(userId: string): Promise<void>;
/**
 * Trigger: Achievement unlocked
 */
export declare function triggerAchievementNotification(userId: string, achievementName: string, achievementDescription: string): Promise<void>;
/**
 * Trigger: Level up notification
 */
export declare function triggerLevelUpNotification(userId: string, newLevel: number): Promise<void>;
/**
 * Trigger: Daily reminder
 */
export declare function triggerDailyReminderNotification(userId: string): Promise<void>;
/**
 * Trigger: Friend request received
 */
export declare function triggerFriendRequestNotification(userId: string, requesterName: string): Promise<void>;
/**
 * Batch send notifications (for admin broadcasts)
 */
export declare function sendBroadcastNotification(userIds: string[], payload: NotificationPayload): Promise<void>;
export {};
