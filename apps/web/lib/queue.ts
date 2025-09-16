import { Queue } from "bullmq";
import IORedis from "ioredis";

let connection: IORedis | null = null;
let runQueue: Queue | null = null;

// Only connect if REDIS_URL is set (e.g. in production with Redis provisioned)
if (process.env.REDIS_URL) {
  connection = new IORedis(process.env.REDIS_URL);
  runQueue = new Queue("run-queue", { connection });
}

export { runQueue };

export async function enqueueRun(taskId: string, workflowId?: string) {
  if (!runQueue) {
    console.log("Redis queue disabled. Skipping enqueueRun.");
    return;
  }

  await runQueue.add("process-run", {
    taskId,
    workflowId,
  });
}
