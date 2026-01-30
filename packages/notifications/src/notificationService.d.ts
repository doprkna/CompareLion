export type NotificationType = 'story_remix' | 'story_sticker' | 'story_reaction' | 'challenge_entry' | string;
export interface NotificationMetadata {
    [key: string]: any;
}
/**
 * Create a notification for a user
 * @param userId - The user ID to notify
 * @param type - Notification type (e.g., 'story_remix', 'story_sticker')
 * @param metadata - Additional metadata for the notification
 */
export declare function createNotification(userId: string, type: NotificationType, metadata?: NotificationMetadata): Promise<void>;
/**
 * Get notifications for a user
 * @param userId - The user ID
 * @returns Array of notifications
 */
export declare function getUserNotifications(userId: string): Promise<never[]>;
