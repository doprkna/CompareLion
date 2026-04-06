/**
 * Regional Job Scheduler (v0.11.16)
 *
 * PLACEHOLDER: Timezone-aware job scheduling.
 */
/**
 * Schedule regional jobs
 */
export declare function scheduleRegionalJobs(): Promise<void>;
/**
 * Get all users in timezone for reset
 */
export declare function getUsersInTimezone(timezone: string): Promise<never[]>;
/**
 * Preview upcoming resets across all zones
 */
export declare function previewUpcomingResets(): Promise<never[]>;
/**
 * Execute daily reset for region
 */
export declare function executeDailyReset(region: string): Promise<void>;
