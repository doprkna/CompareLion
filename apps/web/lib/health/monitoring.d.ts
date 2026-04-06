/**
 * System Monitoring (v0.8.12)
 *
 * PLACEHOLDER: Observability and metrics collection.
 */
export interface SystemMetric {
    metricType: string;
    name: string;
    value: number;
    unit: string;
    endpoint?: string;
    timestamp: Date;
}
export interface HealthCheck {
    checkType: string;
    status: "healthy" | "degraded" | "unhealthy";
    message?: string;
    responseTime?: number;
    metadata?: Record<string, any>;
}
/**
 * Record API latency metric
 */
export declare function recordApiLatency(_endpoint: string, _latencyMs: number): Promise<void>;
/**
 * Record event throughput
 */
export declare function recordEventThroughput(_eventsPerSecond: number): Promise<void>;
/**
 * Record error rate
 */
export declare function recordErrorRate(_endpoint: string, _errorRate: number): Promise<void>;
/**
 * Check database health
 */
export declare function checkDatabase(): Promise<HealthCheck>;
/**
 * Check Redis health
 */
export declare function checkRedis(): Promise<HealthCheck>;
/**
 * Check job queue health
 */
export declare function checkJobQueues(): Promise<HealthCheck>;
/**
 * Run all health checks
 */
export declare function runHealthChecks(): Promise<HealthCheck[]>;
/**
 * Get system health summary
 */
export declare function getSystemHealth(): Promise<{
    status: "healthy" | "unhealthy" | "degraded";
    checks: HealthCheck[];
    timestamp: Date;
}>;
/**
 * Create error alert
 */
export declare function createErrorAlert(_severity: "info" | "warning" | "error" | "critical", _source: string, _message: string, _stackTrace?: string, _metadata?: Record<string, any>): Promise<void>;
