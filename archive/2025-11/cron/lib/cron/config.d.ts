/**
 * Cron Job Configuration (v0.29.21)
 *
 * Central registry of all cron jobs with their schedules and handlers.
 */
import { type CronJobConfig } from './cron';
/**
 * Register all cron jobs
 */
export declare function registerAllCronJobs(): void;
/**
 * Get all job configurations
 */
export declare function getCronJobsConfig(): CronJobConfig[];
