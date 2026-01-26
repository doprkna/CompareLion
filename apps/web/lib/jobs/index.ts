import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { SCHEDULER_INTERVAL_MS } from '@/lib/config';
import { hasRedis } from '@/lib/env';

let _connection: IORedis | null = null;
let _schedulerQueue: Queue | null = null;

function getConnection(): IORedis | null {
  if (!hasRedis) {
    return null;
  }
  if (!_connection && process.env.REDIS_URL) {
    _connection = new IORedis(process.env.REDIS_URL);
  }
  return _connection;
}

function getSchedulerQueue(): Queue | null {
  if (!_schedulerQueue) {
    const conn = getConnection();
    if (!conn) return null;
    
    _schedulerQueue = new Queue('scheduler', { connection: conn });

    // Register a repeatable job to trigger scheduling logic
    // Use a consistent jobId so duplicates are ignored
    if (typeof process !== 'undefined') {
      _schedulerQueue.add(
        'run',
        {},
        {
          jobId: 'scheduler:run',
          repeat: { every: SCHEDULER_INTERVAL_MS },
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    }
  }
  return _schedulerQueue;
}

export const schedulerQueue = new Proxy({} as Queue | null, {
  get(_target, prop) {
    const queue = getSchedulerQueue();
    if (!queue) return undefined;
    const value = (queue as any)[prop];
    return typeof value === 'function' ? value.bind(queue) : value;
  },
  set(_target, prop, value) {
    const queue = getSchedulerQueue();
    if (queue) {
      (queue as any)[prop] = value;
    }
    return true;
  }
}) as Queue | null;

// Export other queues for ease of import
export { questionGenQueue } from '@/lib/jobs/questionGen.queue';
