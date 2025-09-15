import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')

export const runQueue = new Queue('run-queue', { connection })

export async function enqueueRun(taskId: string, workflowId?: string) {
  await runQueue.add('process-run', {
    taskId,
    workflowId,
  })
}





