import { Queue } from "bullmq";
import { getRedisClient, hasRedis } from "@parel/redis";

let _connection: ReturnType<typeof getRedisClient> = null;
let _runQueue: Queue | null = null;

function getConnection() {
  if (!hasRedis) return null;
  if (!_connection) _connection = getRedisClient();
  return _connection;
}

function getRunQueue(): Queue | null {
  const conn = getConnection();
  if (!conn) return null;
  if (!_runQueue) _runQueue = new Queue("run-queue", { connection: conn });
  return _runQueue;
}

export const runQueue = new Proxy({} as Queue | null, {
  get(_target, prop) {
    const queue = getRunQueue();
    if (!queue) return undefined;
    const value = (queue as any)[prop];
    return typeof value === "function" ? value.bind(queue) : value;
  },
  set(_target, prop, value) {
    const queue = getRunQueue();
    if (queue) (queue as any)[prop] = value;
    return true;
  },
}) as Queue | null;

export async function enqueueRun(taskId: string, workflowId?: string) {
  const queue = getRunQueue();
  if (!queue) return;
  await queue.add("process-run", { taskId, workflowId });
}
