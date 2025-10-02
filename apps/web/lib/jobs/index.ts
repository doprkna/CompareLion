import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { SCHEDULER_INTERVAL_MS } from '@/lib/config';

// Redis connection
const connection = new IORedis(process.env.REDIS_URL || '');

// Scheduler queue for batch processing of SSSCs
export const schedulerQueue = new Queue('scheduler', { connection });

// Register a repeatable job to trigger scheduling logic
// Use a consistent jobId so duplicates are ignored
schedulerQueue.add(
  'run',
  {},
  {
    jobId: 'scheduler:run',
    repeat: { every: SCHEDULER_INTERVAL_MS },
    removeOnComplete: true,
    removeOnFail: true,
  }
);

// Export other queues for ease of import
export { questionGenQueue } from '@/lib/jobs/questionGen.queue';
