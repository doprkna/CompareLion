/**
 * Unified Cron Runner (v0.29.21)
 * 
 * Handles registration, locking, and logging for all cron jobs.
 * Supports Redis-based locking (if REDIS_URL is set) or in-memory fallback.
 */

import { prisma } from '@/lib/db';
import { CronJobStatus } from '@parel/db/client';
import { logger } from '@/lib/logger';

// Redis connection for locking (optional) - dynamically imported to avoid webpack bundling issues
const REDIS_URL = process.env.REDIS_URL;
let redisClient: any = null;

// Initialize Redis connection lazily at runtime (v0.33.4 - webpack fix)
async function getRedisClient() {
  if (!REDIS_URL) return null;
  
  if (redisClient) return redisClient;
  
  try {
    const IORedis = (await import('ioredis')).default;
    redisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    return redisClient;
  } catch (err) {
    logger.warn('[Cron] Redis not available, using in-memory locks');
    return null;
  }
}

// In-memory lock map (fallback when Redis is not available)
const inMemoryLocks = new Map<string, { locked: boolean; lockedAt: Date }>();

// Job registry
export interface CronJobConfig {
  key: string;
  schedule: string; // cron expression or @daily, @weekly, @monthly
  handler: () => Promise<void>;
  description?: string;
}

const registeredJobs = new Map<string, CronJobConfig>();

/**
 * Register a cron job
 */
export function registerCronJob(config: CronJobConfig): void {
  registeredJobs.set(config.key, config);
  logger.info(`[Cron] Registered job: ${config.key} (${config.schedule})`);
}

/**
 * Acquire a lock for a job (prevents duplicate parallel runs)
 */
async function acquireLock(jobKey: string, timeoutMs: number = 300000): Promise<boolean> {
  const redis = await getRedisClient();
  if (redis) {
    // Use Redis lock
    try {
      const lockKey = `cron:lock:${jobKey}`;
      const result = await redis.set(lockKey, '1', 'EX', Math.floor(timeoutMs / 1000), 'NX');
      return result === 'OK';
    } catch (err) {
      logger.warn(`[Cron] Redis lock failed for ${jobKey}, falling back to in-memory`);
      // Fallback to in-memory
    }
  }

  // In-memory lock (fallback or when Redis is not available)
  const existing = inMemoryLocks.get(jobKey);
  if (existing?.locked) {
    // Check if lock expired (5 minutes default)
    const lockAge = Date.now() - existing.lockedAt.getTime();
    if (lockAge > timeoutMs) {
      // Lock expired, remove it
      inMemoryLocks.delete(jobKey);
    } else {
      return false; // Still locked
    }
  }

  inMemoryLocks.set(jobKey, { locked: true, lockedAt: new Date() });
  return true;
}

/**
 * Release a lock for a job
 */
async function releaseLock(jobKey: string): Promise<void> {
  const redis = await getRedisClient();
  if (redis) {
    try {
      const lockKey = `cron:lock:${jobKey}`;
      await redis.del(lockKey);
    } catch (err) {
      logger.warn(`[Cron] Redis unlock failed for ${jobKey}`);
    }
  }

  // Release in-memory lock
  inMemoryLocks.delete(jobKey);
}

/**
 * Run a registered cron job with locking and logging
 */
export async function runCronJob(jobKey: string): Promise<{ success: boolean; error?: string; durationMs: number }> {
  const config = registeredJobs.get(jobKey);
  if (!config) {
    throw new Error(`Cron job not found: ${jobKey}`);
  }

  // Try to acquire lock
  const locked = await acquireLock(jobKey);
  if (!locked) {
    logger.warn(`[Cron] Job ${jobKey} is already running, skipping`);
    return { success: false, error: 'Job already running', durationMs: 0 };
  }

  const startedAt = new Date();
  let logEntry: { id: string } | null = null;

  try {
    // Create log entry
    logEntry = await prisma.cronJobLog.create({
      data: {
        jobKey,
        status: CronJobStatus.success, // Will update if error occurs
        startedAt,
      },
    });

    // Run the handler
    await config.handler();

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    // Update log entry with success
    if (logEntry) {
      await prisma.cronJobLog.update({
        where: { id: logEntry.id },
        data: {
          status: CronJobStatus.success,
          finishedAt,
          durationMs,
        },
      });
    }

    logger.info(`[Cron] Job ${jobKey} completed successfully in ${durationMs}ms`);
    return { success: true, durationMs };

  } catch (error) {
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Update log entry with error
    if (logEntry) {
      await prisma.cronJobLog.update({
        where: { id: logEntry.id },
        data: {
          status: CronJobStatus.error,
          finishedAt,
          durationMs,
          errorMessage,
        },
      });
    }

    logger.error(`[Cron] Job ${jobKey} failed: ${errorMessage}`);
    return { success: false, error: errorMessage, durationMs };
  } finally {
    // Always release lock
    await releaseLock(jobKey);
  }
}

/**
 * Get all registered jobs
 */
export function getRegisteredJobs(): CronJobConfig[] {
  return Array.from(registeredJobs.values());
}

/**
 * Get job status (last run info from logs)
 */
export async function getJobStatus(jobKey: string): Promise<{
  lastRun: Date | null;
  lastStatus: CronJobStatus | null;
  lastDurationMs: number | null;
  lastError: string | null;
} | null> {
  const config = registeredJobs.get(jobKey);
  if (!config) {
    return null;
  }

  const lastLog = await prisma.cronJobLog.findFirst({
    where: { jobKey },
    orderBy: { startedAt: 'desc' },
  });

  return {
    lastRun: lastLog?.startedAt || null,
    lastStatus: lastLog?.status || null,
    lastDurationMs: lastLog?.durationMs || null,
    lastError: lastLog?.errorMessage || null,
  };
}

/**
 * Cleanup old logs (older than 30 days)
 */
export async function cleanupCronLogs(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.cronJobLog.deleteMany({
    where: {
      startedAt: {
        lt: cutoffDate,
      },
    },
  });

  logger.info(`[Cron] Cleaned up ${result.count} old log entries`);
  return result.count;
}

