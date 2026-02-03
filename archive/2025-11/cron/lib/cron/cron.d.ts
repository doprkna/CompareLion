/**
 * Unified Cron Runner (v0.29.21)
 *
 * Handles registration, locking, and logging for all cron jobs.
 * Supports Redis-based locking (if REDIS_URL is set) or in-memory fallback.
 */
import { CronJobStatus } from '@parel/db/client';
export interface CronJobConfig {
    key: string;
    schedule: string;
    handler: () => Promise<void>;
    description?: string;
}
/**
 * Register a cron job
 */
export declare function registerCronJob(config: CronJobConfig): void;
/**
 * Run a registered cron job with locking and logging
 */
export declare function runCronJob(jobKey: string): Promise<{
    success: boolean;
    error?: string;
    durationMs: number;
}>;
/**
 * Get all registered jobs
 */
export declare function getRegisteredJobs(): CronJobConfig[];
/**
 * Get job status (last run info from logs)
 */
export declare function getJobStatus(jobKey: string): Promise<{
    lastRun: Date | null;
    lastStatus: CronJobStatus | null;
    lastDurationMs: number | null;
    lastError: string | null;
} | null>;
/**
 * Cleanup old logs (older than 30 days)
 */
export declare function cleanupCronLogs(daysToKeep?: number): Promise<number>;
