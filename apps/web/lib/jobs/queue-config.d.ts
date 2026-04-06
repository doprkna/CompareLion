/**
 * Job Queue Configuration (v0.8.11)
 *
 * PLACEHOLDER: BullMQ queue balancing and priority management.
 */
export interface QueueConfig {
    queueName: string;
    displayName: string;
    description: string;
    priority: number;
    concurrency: number;
    maxRetries: number;
    backoffStrategy: "exponential" | "fixed" | "linear";
    backoffDelay: number;
    isEnabled: boolean;
}
export declare const QUEUE_CONFIGS: QueueConfig[];
/**
 * Calculate backoff delay
 */
export declare function calculateBackoff(strategy: "exponential" | "fixed" | "linear", baseDelay: number, attempt: number): number;
/**
 * Get queue by priority (for load balancing)
 */
export declare function getQueuesByPriority(): {
    high: QueueConfig[];
    medium: QueueConfig[];
    low: QueueConfig[];
};
/**
 * Dynamic concurrency adjustment based on system load
 */
export declare function adjustConcurrency(queueName: string, currentLoad: number): number;
/**
 * PLACEHOLDER: Initialize queues
 */
export declare function initializeQueues(): Promise<void>;
/**
 * PLACEHOLDER: Get queue health
 */
export declare function getQueueHealth(_queueName: string): Promise<{
    active: number;
    waiting: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
}>;
