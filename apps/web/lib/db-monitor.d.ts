/**
 * Database Performance Monitoring
 *
 * Tracks slow queries and provides performance insights.
 */
interface QueryLog {
    query: string;
    duration: number;
    timestamp: Date;
    params?: any;
}
/**
 * Log slow query
 */
export declare function logSlowQuery(query: string, duration: number, params?: any): void;
/**
 * Get slow query stats
 */
export declare function getSlowQueryStats(): {
    count: number;
    avgDuration: number;
    maxDuration: number;
    queries: QueryLog[];
};
/**
 * Clear slow query logs
 */
export declare function clearSlowQueryLogs(): void;
/**
 * Setup Prisma middleware for query monitoring
 * Note: This is called from the Prisma client initialization
 */
export declare function setupQueryMonitoring(): void;
export {};
