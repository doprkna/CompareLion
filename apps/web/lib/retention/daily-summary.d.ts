/**
 * Daily Summary System (v0.11.9)
 *
 * PLACEHOLDER: Generate and display daily activity summaries.
 */
/**
 * Generate daily summary for yesterday
 */
export declare function generateDailySummary(_userId: string): Promise<null>;
/**
 * Get unviewed daily summaries
 */
export declare function getUnviewedSummaries(_userId: string): Promise<never[]>;
/**
 * Mark summary as viewed
 */
export declare function markSummaryViewed(_userId: string, _summaryId: string): Promise<void>;
