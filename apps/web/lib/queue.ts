import { Queue } from "bullmq";
import IORedis from "ioredis";
import { hasRedis } from '@/lib/env';

let _connection: IORedis | null = null;
let _runQueue: Queue | null = null;

function getConnection(): IORedis | null {
  if (!hasRedis) {
    return null;
  }
  if (!_connection && process.env.REDIS_URL) {
    _connection = new IORedis(process.env.REDIS_URL);
  }
  return _connection;
}

function getRunQueue(): Queue | null {
  if (!_runQueue) {
    const conn = getConnection();
    if (conn) {
      _runQueue = new Queue("run-queue", { connection: conn });
    }
  }
  return _runQueue;
}

export const runQueue = new Proxy({} as Queue | null, {
  get(_target, prop) {
    const queue = getRunQueue();
    if (!queue) return undefined;
    const value = (queue as any)[prop];
    return typeof value === 'function' ? value.bind(queue) : value;
  },
  set(_target, prop, value) {
    const queue = getRunQueue();
    if (queue) {
      (queue as any)[prop] = value;
    }
    return true;
  }
}) as Queue | null;

export async function enqueueRun(taskId: string, workflowId?: string) {
  const queue = getRunQueue();
  if (!queue) {
    return;
  }

  await queue.add("process-run", {
    taskId,
    workflowId,
  });
}
