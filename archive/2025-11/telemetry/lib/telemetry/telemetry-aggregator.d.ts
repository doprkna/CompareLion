/**
 * Telemetry Aggregation Worker (v0.11.7)
 *
 * Aggregate daily telemetry events for analytics.
 */
/**
 * Aggregate all telemetry for yesterday
 */
export declare function aggregateTelemetryDaily(): Promise<void>;
/**
 * Get aggregated metrics for date range
 */
export declare function getAggregatedMetrics(startDate: Date, endDate: Date, type?: string): Promise<any>;
/**
 * Get summary statistics
 */
export declare function getSummaryStats(days?: number): Promise<{
    pageViews: any;
    actions: any;
    errors: any;
    apiCalls: any;
    sessions: any;
    avgApiLatency: number;
    errorRate: number;
    avgSessionLength: number;
}>;
