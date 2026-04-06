/**
 * Activity Logging System
 *
 * Centralized utility for tracking user activities across the app.
 * All activities are stored in the database for the user feed.
 */
export type ActivityType = "xp" | "message" | "flow" | "achievement" | "level_up" | "purchase" | "streak" | "login";
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
export declare function logActivity(userId: string, type: ActivityType, title: string, description?: string, metadata?: ActivityMetadata): Promise<void>;
/**
 * Helper: Log XP gain
 */
export declare function logXpGain(userId: string, amount: number, source: string): Promise<void>;
/**
 * Helper: Log message sent
 */
export declare function logMessageSent(userId: string, recipientEmail: string): Promise<void>;
/**
 * Helper: Log flow completion
 */
export declare function logFlowComplete(userId: string, questionsAnswered: number): Promise<void>;
/**
 * Helper: Log achievement unlock
 */
export declare function logAchievementUnlock(userId: string, achievementTitle: string, achievementCode: string, xpReward: number): Promise<void>;
/**
 * Helper: Log level up
 */
export declare function logLevelUp(userId: string, newLevel: number): Promise<void>;
/**
 * Helper: Log purchase
 */
export declare function logPurchase(userId: string, itemName: string, cost: number, currency: "funds" | "diamonds"): Promise<void>;
/**
 * Helper: Log streak milestone
 */
export declare function logStreakMilestone(userId: string, streakDays: number): Promise<void>;
/**
 * Helper: Log login
 */
export declare function logLogin(userId: string): Promise<void>;
export {};
