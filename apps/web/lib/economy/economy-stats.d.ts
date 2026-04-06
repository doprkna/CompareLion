/**
 * Economy Statistics (v0.11.13)
 *
 * PLACEHOLDER: Track global economy metrics and inflation.
 */
/**
 * Record daily economy stats
 */
export declare function recordDailyStats(): Promise<void>;
/**
 * Get economy stats for date range
 */
export declare function getEconomyStats(startDate: Date, endDate: Date): Promise<never[]>;
/**
 * Get top earners
 */
export declare function getTopEarners(limit?: number): Promise<null>;
/**
 * Calculate weekly economy summary
 */
export declare function calculateWeeklySummary(): Promise<null>;
