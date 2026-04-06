/**
 * Mini-Event System (v0.8.15)
 *
 * PLACEHOLDER: Short community-wide missions with collective rewards.
 */
export interface MiniEventDefinition {
    eventId: string;
    name: string;
    description: string;
    icon: string;
    eventType: "answer_truths" | "complete_challenges" | "earn_xp" | "social_activity" | "flow_completions";
    goalType: "collective" | "individual_threshold";
    targetCount: number;
    duration: number;
    rewards: EventReward[];
}
export interface EventReward {
    type: "badge" | "aura" | "gold" | "diamonds" | "xp" | "title" | "theme";
    id?: string;
    amount?: number;
    description: string;
}
export declare const MINI_EVENT_TEMPLATES: MiniEventDefinition[];
/**
 * Calculate event progress percentage
 */
export declare function calculateEventProgress(currentProgress: number, targetCount: number): number;
/**
 * Check if event is currently active
 */
export declare function isEventActive(startTime: Date, endTime: Date): boolean;
/**
 * Get time remaining in event
 */
export declare function getTimeRemaining(endTime: Date): {
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
};
/**
 * PLACEHOLDER: Create mini-event
 */
export declare function createMiniEvent(_template: MiniEventDefinition, _startTime: Date): Promise<null>;
/**
 * PLACEHOLDER: Update event progress
 */
export declare function updateEventProgress(_eventId: string, _userId: string, _contribution: number): Promise<null>;
/**
 * PLACEHOLDER: Distribute event rewards
 */
export declare function distributeEventRewards(_eventId: string): Promise<null>;
/**
 * PLACEHOLDER: Auto-start/end events (cron job)
 */
export declare function processScheduledEvents(): Promise<null>;
