import { Worker, Job } from 'bullmq';
import { connection } from '../lib/queue/connection';
import { generateAndInsertOneQuestion } from './generatorStub';
import { prisma } from '@parel/db/src/client';

const queueName = 'question-gen';

export const worker = new Worker(queueName, async (job: Job<{ ssscId: number; runVersion?: string }>) => {
  const { ssscId, runVersion = 'v1' } = job.data;
  // Create JobLog entry
  // @ts-ignore: bypass TS missing jobLog on Prisma client until regenerated
  const jobLog = await (prisma as any).jobLog.updateMany({
    where: { idempotencyKey: `${ssscId}:${runVersion}`, status: 'queued' },
    data: { status: 'running', startedAt: new Date() },
  });
  try {
    // Fetch category to decide count, ignore for stub
    await generateAndInsertOneQuestion(ssscId, runVersion);
    // @ts-ignore: bypass TS missing jobLog on Prisma client until regenerated
    await (prisma as any).jobLog.updateMany({
      where: { idempotencyKey: `${ssscId}:${runVersion}` },
      data: { status: 'succeeded', finishedAt: new Date() },
    });
  } catch (err: any) {
    // @ts-ignore: bypass TS missing jobLog on Prisma client until regenerated
    await (prisma as any).jobLog.updateMany({
      where: { idempotencyKey: `${ssscId}:${runVersion}` },
      data: { status: 'failed', error: err.message, finishedAt: new Date() },
    });
    throw err;
  }
}, { connection });
