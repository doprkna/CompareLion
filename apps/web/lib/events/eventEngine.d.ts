/**
 * Event Engine
 * Event activation, deactivation, and wildcard generation
 * v0.36.41 - Events System 1.0
 */
/**
 * Activate an event
 * Sets active flag to true
 */
export declare function activateEvent(eventId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Deactivate an event
 * Sets active flag to false
 */
export declare function deactivateEvent(eventId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get current active events
 */
export declare function getCurrentActiveEvents(): Promise<any>;
/**
 * Log user participation in an event
 */
export declare function logEventParticipation(userId: string, eventId: string): Promise<void>;
/**
 * Generate a wildcard random event
 * This is a stub - generates a random event with random effects
 *
 * TODO: Implement proper wildcard event generation logic
 * - Random event templates
 * - Weighted effect selection
 * - Duration randomization
 * - Effect value randomization
 */
export declare function generateWildcardEvent(): Promise<{
    success: boolean;
    eventId?: string;
    error?: string;
}>;
/**
 * Check and auto-deactivate expired events
 * This is a stub for cron job - call this periodically
 *
 * TODO: Set up cron job to call this function
 * Example: cron.schedule('0 * * * *', checkExpiredEvents) // Every hour
 */
export declare function checkExpiredEvents(): Promise<{
    deactivated: number;
}>;
