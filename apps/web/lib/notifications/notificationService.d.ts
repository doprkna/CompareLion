/**
 * Notification Service
 * Handle in-app notifications for story-related events
 * v0.40.17 - Story Notifications 1.0 (In-App Alerts)
 */
export type NotificationType = 'story_reaction' | 'story_sticker' | 'story_remix' | 'challenge_entry' | 'challenge_end' | 'weekly_story_ready';
export interface NotificationData {
    storyId?: string;
    remixId?: string;
    challengeId?: string;
    reactionType?: string;
    stickerId?: string;
    [key: string]: any;
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
export declare function createNotification(userId: string, type: NotificationType, data: NotificationData): Promise<Notification>;
/**
 * Get notifications for a user
 * Returns unread + last 50 read notifications
 */
export declare function getNotifications(userId: string): Promise<Notification[]>;
/**
 * Get unread notification count
 */
export declare function getUnreadCount(userId: string): Promise<number>;
/**
 * Mark notification as read
 */
export declare function markNotificationRead(notificationId: string, userId: string): Promise<void>;
/**
 * Mark all notifications as read for a user
 */
export declare function markAllNotificationsRead(userId: string): Promise<void>;
