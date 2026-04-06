/**
 * Global Events System
 *
 * Manages limited-time bonuses and special events.
 */
export interface GlobalEventData {
    id: string;
    title: string;
    description?: string;
    emoji?: string;
    type: string;
    bonusType: string;
    bonusValue: number;
    targetScope?: string;
    startAt: Date;
    endAt: Date;
    active: boolean;
}
/**
 * Get all currently active events
 */
export declare function getActiveEvents(): Promise<GlobalEventData[]>;
/**
 * Apply event bonuses to a base value
 *
 * @param baseValue - Original value (e.g., 100 XP)
 * @param actionScope - Action type (e.g., "quiz", "dare", "flow")
 * @param rewardType - Type of reward (e.g., "xp", "gold", "karma")
 * @returns Enhanced value with bonuses applied
 */
export declare function applyEventBonuses(baseValue: number, actionScope: string, rewardType: string): Promise<{
    value: number;
    bonusApplied: number;
    activeEvents: string[];
}>;
/**
 * Create a new global event
 */
export declare function createGlobalEvent(data: {
    title: string;
    description?: string;
    emoji?: string;
    type: string;
    bonusType: string;
    bonusValue: number;
    targetScope?: string;
    startAt: Date;
    endAt: Date;
    createdBy?: string;
}): Promise<GlobalEventData>;
/**
 * Update an existing event
 */
export declare function updateGlobalEvent(eventId: string, updates: Partial<GlobalEventData>): Promise<GlobalEventData | null>;
/**
 * Deactivate an event
 */
export declare function deactivateEvent(eventId: string): Promise<void>;
/**
 * Auto-deactivate expired events (cron job)
 */
export declare function deactivateExpiredEvents(): Promise<number>;
/**
 * Get event display info
 */
export declare function getEventDisplayInfo(event: GlobalEventData): {
    color: string;
    badgeText: string;
    bonusText: string;
};
/**
 * Check if event is currently active
 */
export declare function isEventActive(event: GlobalEventData): boolean;
/**
 * Format event duration
 */
export declare function formatEventDuration(startAt: Date, endAt: Date): string;
/**
 * Get time remaining for active event
 */
export declare function getTimeRemaining(endAt: Date): string;
