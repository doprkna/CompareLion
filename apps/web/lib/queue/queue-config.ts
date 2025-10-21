/**
 * BullMQ Queue Configuration (v0.11.2)
 * 
 * Priority-based queue system with concurrency control.
 */

import { Queue, QueueOptions, Worker, WorkerOptions } from "bullmq";
import Redis from "ioredis";
import os from "os";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Redis connection for BullMQ
 */
const connection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // BullMQ requires this
  enableReadyCheck: false,
});

/**
 * Queue priorities and configurations
 */
export const QUEUE_PRIORITIES = {
  HIGH: "high", // XP updates, messages
  MEDIUM: "medium", // AI generation, notifications
  LOW: "low", // Analytics, reporting
} as const;

export type QueuePriority = (typeof QUEUE_PRIORITIES)[keyof typeof QUEUE_PRIORITIES];

/**
 * Queue-specific configurations
 */
export const QUEUE_CONFIG = {
  [QUEUE_PRIORITIES.HIGH]: {
    name: "high-priority",
    concurrency: 10, // Process 10 jobs concurrently
    limiter: {
      max: 100, // Max 100 jobs
      duration: 1000, // per second
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential" as const,
        delay: 1000,
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 1000,
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    },
  },
  [QUEUE_PRIORITIES.MEDIUM]: {
    name: "medium-priority",
    concurrency: 5,
    limiter: {
      max: 50,
      duration: 1000,
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential" as const,
        delay: 2000,
      },
      removeOnComplete: {
        age: 7200,
        count: 500,
      },
      removeOnFail: {
        age: 86400,
      },
    },
  },
  [QUEUE_PRIORITIES.LOW]: {
    name: "low-priority",
    concurrency: 2,
    limiter: {
      max: 20,
      duration: 1000,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential" as const,
        delay: 5000,
      },
      removeOnComplete: {
        age: 3600,
        count: 100,
      },
      removeOnFail: {
        age: 86400,
      },
    },
  },
} as const;

/**
 * Create queue instance
 */
export function createQueue(priority: QueuePriority): Queue {
  const config = QUEUE_CONFIG[priority];
  
  return new Queue(config.name, {
    connection,
    defaultJobOptions: config.defaultJobOptions,
    limiter: config.limiter,
  } as QueueOptions);
}

/**
 * Worker concurrency control based on CPU usage
 */
export function calculateOptimalConcurrency(
  maxConcurrency: number,
  targetCpuUsage: number = 0.75 // 75% CPU target
): number {
  const cpuCount = os.cpus().length;
  const loadAverage = os.loadavg()[0]; // 1-minute load average
  const currentCpuUsage = loadAverage / cpuCount;
  
  if (currentCpuUsage > targetCpuUsage) {
    // Reduce concurrency if CPU usage is high
    return Math.max(1, Math.floor(maxConcurrency * 0.5));
  }
  
  return maxConcurrency;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queue: Queue) {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  
  return {
    name: queue.name,
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Get all queue statistics
 */
export async function getAllQueueStats() {
  const queues = [
    createQueue(QUEUE_PRIORITIES.HIGH),
    createQueue(QUEUE_PRIORITIES.MEDIUM),
    createQueue(QUEUE_PRIORITIES.LOW),
  ];
  
  const stats = await Promise.all(queues.map((q) => getQueueStats(q)));
  
  // Close queues
  await Promise.all(queues.map((q) => q.close()));
  
  return stats;
}

/**
 * Job types for each priority
 */
export const JOB_TYPES = {
  // High priority
  XP_UPDATE: "xp:update",
  MESSAGE_SEND: "message:send",
  NOTIFICATION_SEND: "notification:send",
  
  // Medium priority
  AI_GENERATE: "ai:generate",
  CHALLENGE_PROCESS: "challenge:process",
  ACHIEVEMENT_CHECK: "achievement:check",
  
  // Low priority
  ANALYTICS_UPDATE: "analytics:update",
  REPORT_GENERATE: "report:generate",
  CLEANUP_OLD_DATA: "cleanup:old-data",
} as const;

/**
 * Add job to appropriate queue based on type
 */
export async function addJob(
  jobType: string,
  data: any,
  options: any = {}
) {
  let priority: QueuePriority;
  
  // Determine priority based on job type
  if (
    jobType === JOB_TYPES.XP_UPDATE ||
    jobType === JOB_TYPES.MESSAGE_SEND ||
    jobType === JOB_TYPES.NOTIFICATION_SEND
  ) {
    priority = QUEUE_PRIORITIES.HIGH;
  } else if (
    jobType === JOB_TYPES.AI_GENERATE ||
    jobType === JOB_TYPES.CHALLENGE_PROCESS ||
    jobType === JOB_TYPES.ACHIEVEMENT_CHECK
  ) {
    priority = QUEUE_PRIORITIES.MEDIUM;
  } else {
    priority = QUEUE_PRIORITIES.LOW;
  }
  
  const queue = createQueue(priority);
  const job = await queue.add(jobType, data, options);
  await queue.close();
  
  return job;
}

/**
 * CPU usage monitoring
 */
export function getCpuUsage() {
  const cpuCount = os.cpus().length;
  const loadAverage = os.loadavg();
  
  return {
    cpuCount,
    loadAverage1min: loadAverage[0],
    loadAverage5min: loadAverage[1],
    loadAverage15min: loadAverage[2],
    usagePercent1min: (loadAverage[0] / cpuCount) * 100,
    usagePercent5min: (loadAverage[1] / cpuCount) * 100,
    usagePercent15min: (loadAverage[2] / cpuCount) * 100,
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  return {
    total: totalMem,
    free: freeMem,
    used: usedMem,
    usagePercent: (usedMem / totalMem) * 100,
    totalGB: (totalMem / 1024 / 1024 / 1024).toFixed(2),
    usedGB: (usedMem / 1024 / 1024 / 1024).toFixed(2),
  };
}











