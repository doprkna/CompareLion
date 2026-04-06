/**
 * Notification System Helper
 *
 * Creates persistent notifications and broadcasts them to connected clients.
 * Includes simple rate limiting to prevent spam.
 */
/**
 * Create a notification for a user
 *
 * @param userId User ID to notify
 * @param type Notification type (message, xp, achievement, system)
 * @param title Notification title
 * @param body Optional notification body
 * @returns Created notification or null if duplicate detected
 */
export declare function notify(userId: string, type: string, title: string, body?: string): Promise<any | null>;
/**
 * Helper: Notify XP gain
 */
export declare function notifyXpGain(userId: string, amount: number, source: string): Promise<any>;
/**
 * Helper: Notify new message
 */
export declare function notifyMessage(userId: string, fromEmail: string, preview: string): Promise<any>;
/**
 * Helper: Notify achievement unlock
 */
export declare function notifyAchievement(userId: string, achievementTitle: string, xpReward: number): Promise<any>;
/**
 * Helper: Notify system message
 */
export declare function notifySystem(userId: string, title: string, body?: string): Promise<any>;
