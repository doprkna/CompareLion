/**
 * BullMQ Queue Configuration (v0.11.2)
 *
 * Priority-based queue system with concurrency control.
 */
import { Queue } from "bullmq";
/**
 * Queue priorities and configurations
 */
export declare const QUEUE_PRIORITIES: {
    readonly HIGH: "high";
    readonly MEDIUM: "medium";
    readonly LOW: "low";
};
export type QueuePriority = (typeof QUEUE_PRIORITIES)[keyof typeof QUEUE_PRIORITIES];
/**
 * Queue-specific configurations
 */
export declare const QUEUE_CONFIG: {
    readonly high: {
        readonly name: "high-priority";
        readonly concurrency: 10;
        readonly limiter: {
            readonly max: 100;
            readonly duration: 1000;
        };
        readonly defaultJobOptions: {
            readonly attempts: 3;
            readonly backoff: {
                readonly type: "exponential";
                readonly delay: 1000;
            };
            readonly removeOnComplete: {
                readonly age: 3600;
                readonly count: 1000;
            };
            readonly removeOnFail: {
                readonly age: 86400;
            };
        };
    };
    readonly medium: {
        readonly name: "medium-priority";
        readonly concurrency: 5;
        readonly limiter: {
            readonly max: 50;
            readonly duration: 1000;
        };
        readonly defaultJobOptions: {
            readonly attempts: 5;
            readonly backoff: {
                readonly type: "exponential";
                readonly delay: 2000;
            };
            readonly removeOnComplete: {
                readonly age: 7200;
                readonly count: 500;
            };
            readonly removeOnFail: {
                readonly age: 86400;
            };
        };
    };
    readonly low: {
        readonly name: "low-priority";
        readonly concurrency: 2;
        readonly limiter: {
            readonly max: 20;
            readonly duration: 1000;
        };
        readonly defaultJobOptions: {
            readonly attempts: 3;
            readonly backoff: {
                readonly type: "exponential";
                readonly delay: 5000;
            };
            readonly removeOnComplete: {
                readonly age: 3600;
                readonly count: 100;
            };
            readonly removeOnFail: {
                readonly age: 86400;
            };
        };
    };
};
/**
 * Create queue instance
 */
export declare function createQueue(priority: QueuePriority): Queue;
/**
 * Worker concurrency control based on CPU usage
 */
export declare function calculateOptimalConcurrency(maxConcurrency: number, targetCpuUsage?: number): number;
/**
 * Get queue statistics
 */
export declare function getQueueStats(queue: Queue): Promise<{
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
}>;
/**
 * Get all queue statistics
 */
export declare function getAllQueueStats(): Promise<{
    name: string;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
}[]>;
/**
 * Job types for each priority
 */
export declare const JOB_TYPES: {
    readonly XP_UPDATE: "xp:update";
    readonly MESSAGE_SEND: "message:send";
    readonly NOTIFICATION_SEND: "notification:send";
    readonly AI_GENERATE: "ai:generate";
    readonly CHALLENGE_PROCESS: "challenge:process";
    readonly ACHIEVEMENT_CHECK: "achievement:check";
    readonly ANALYTICS_UPDATE: "analytics:update";
    readonly REPORT_GENERATE: "report:generate";
    readonly CLEANUP_OLD_DATA: "cleanup:old-data";
};
/**
 * Add job to appropriate queue based on type
 */
export declare function addJob(jobType: string, data: any, options?: any): Promise<import("bullmq").Job<any, any, string>>;
/**
 * CPU usage monitoring
 */
export declare function getCpuUsage(): {
    cpuCount: number;
    loadAverage1min: number;
    loadAverage5min: number;
    loadAverage15min: number;
    usagePercent1min: number;
    usagePercent5min: number;
    usagePercent15min: number;
};
/**
 * Memory usage monitoring
 */
export declare function getMemoryUsage(): {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
    totalGB: string;
    usedGB: string;
};
