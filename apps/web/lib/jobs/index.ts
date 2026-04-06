import { Queue } from "bullmq";
import { SCHEDULER_INTERVAL_MS } from "@/lib/config";
import { getRedisClient, hasRedis } from "@parel/redis";

let _connection: ReturnType<typeof getRedisClient> = null;
let _schedulerQueue: Queue | null = null;

function getConnection() {
  if (!hasRedis) return null;
  if (!_connection) _connection = getRedisClient();
  return _connection;
}

function getSchedulerQueue(): Queue | null {
  const conn = getConnection();
  if (!conn) return null;
  if (!_schedulerQueue) {
    _schedulerQueue = new Queue("scheduler", { connection: conn });
    if (typeof process !== "undefined") {
      _schedulerQueue.add("run", {}, {
        jobId: "scheduler:run",
        repeat: { every: SCHEDULER_INTERVAL_MS },
        removeOnComplete: true,
        removeOnFail: true,
      });
    }
  }
  return _schedulerQueue;
}

export const schedulerQueue = new Proxy({} as Queue | null, {
  get(_target, prop) {
    const queue = getSchedulerQueue();
    if (!queue) return undefined;
    const value = (queue as any)[prop];
    return typeof value === "function" ? value.bind(queue) : value;
  },
  set(_target, prop, value) {
    const queue = getSchedulerQueue();
    if (queue) (queue as any)[prop] = value;
    return true;
  },
}) as Queue | null;

export { questionGenQueue } from "@/lib/jobs/questionGen.queue";
