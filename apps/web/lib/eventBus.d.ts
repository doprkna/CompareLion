/**
 * Event Bus System
 *
 * Internal event broadcasting for real-time updates across the app.
 * Uses Node.js EventEmitter for in-process communication.
 *
 * Events:
 * - message:new - New message sent
 * - xp:update - XP updated for user
 * - activity:new - New activity logged
 * - achievement:unlock - Achievement unlocked
 * - level:up - User leveled up
 */
/**
 * Event Bus Interface
 */
export declare const eventBus: {
    /**
     * Subscribe to an event
     * @param event Event name
     * @param listener Callback function
     */
    on: (event: string, listener: (..._args: any[]) => void) => void;
    /**
     * Unsubscribe from an event
     * @param event Event name
     * @param listener Callback function
     */
    off: (event: string, listener: (..._args: any[]) => void) => void;
    /**
     * Emit an event with payload
     * @param event Event name
     * @param payload Event data
     */
    emit: (event: string, payload: any) => void;
    /**
     * Subscribe to an event once (auto-unsubscribe after first call)
     * @param event Event name
     * @param listener Callback function
     */
    once: (event: string, listener: (..._args: any[]) => void) => void;
    /**
     * Remove all listeners for an event
     * @param event Event name (optional, removes all if not provided)
     */
    removeAllListeners: (event?: string) => void;
};
export interface MessageNewEvent {
    senderId: string;
    senderEmail: string;
    receiverId: string;
    receiverEmail: string;
    content: string;
}
export interface XpUpdateEvent {
    userId: string;
    newXp: number;
    oldXp: number;
    gain: number;
    source: string;
}
export interface ActivityNewEvent {
    userId: string;
    type: string;
    title: string;
    description?: string;
}
export interface AchievementUnlockEvent {
    userId: string;
    achievementCode: string;
    achievementTitle: string;
    xpReward: number;
}
export interface LevelUpEvent {
    userId: string;
    newLevel: number;
    oldLevel: number;
}
