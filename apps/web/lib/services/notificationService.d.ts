/**
 * Notification Service
 * Creates and manages notifications
 * v0.36.26 - Notifications 2.0
 */
export type NotificationType = 'achievement' | 'fight' | 'quest' | 'system' | 'loot' | 'levelup' | 'social';
interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    refId?: string;
}
/**
 * Create a notification and auto-cleanup old ones
 */
export declare function createNotification(params: CreateNotificationParams): Promise<string>;
/**
 * Notification creation helpers
 */
export declare function notifyAchievementUnlocked(userId: string, achievementTitle: string, achievementId?: string): Promise<void>;
export declare function notifyFightResult(userId: string, won: boolean, enemyName: string, fightId?: string): Promise<void>;
export declare function notifyQuestionAnswered(userId: string, category?: string): Promise<void>;
export declare function notifyLevelUp(userId: string, newLevel: number): Promise<void>;
export declare function notifyLootDrop(userId: string, itemName: string, rarity: string, itemId?: string): Promise<void>;
export declare function notifySystemMessage(userId: string, message: string): Promise<void>;
export declare function notifySocialInteraction(userId: string, interactionType: 'comment' | 'reaction' | 'mention', username: string, refId?: string): Promise<void>;
/**
 * Pet/Companion notifications (v0.36.32)
 */
export declare function notifyPetUnlocked(userId: string, petName: string): Promise<void>;
export declare function notifyPetLevelUp(userId: string, userPetId: string, newLevel: number): Promise<void>;
export declare function notifyPetEquipped(userId: string, petName: string): Promise<void>;
export {};
