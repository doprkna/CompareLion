import IORedis from 'ioredis';
import { Worker } from 'bullmq';
import { prisma } from '@parel/db/src/client';
import { questionGenQueue, QuestionGenJob } from '@/lib/jobs/questionGen.queue';
import { QGEN_DAILY_LIMIT } from '@/lib/config';
import { logger } from '@/lib/logger';

// Redis connection for scheduler
const redisUrl = process.env.REDIS_URL ?? '';
const connection = new IORedis(redisUrl);

// Batch size from env
const batchSize = Number(process.env.QGEN_BATCH_SIZE ?? '50');

export const schedulerWorker = new Worker(
  'scheduler',
  async job => {
    // Budget guard: limit jobs per day
    const limit = QGEN_DAILY_LIMIT;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const generatedToday = await prisma.questionGeneration.count({ where: { createdAt: { gte: todayStart } } });
    if (generatedToday >= limit) {
      // Log budget exhausted
      await prisma.questionGeneration.create({
        data: {
          id: job.id as string,
          ssscId: job.data.ssscId,
          targetCount: 0,
          status: 'failed',
          error: 'budget_exhausted',
          prompt: '',
        }
      });
      return { skipped: true, reason: 'budget_exhausted' };
    }
    
    // Fetch pending SSSCs
    const pending = await prisma.sssCategory.findMany({ where: { status: 'pending' }, take: batchSize });
    for (const leaf of pending) {
      // Skip leaves already satisfied
      const existingCount = await prisma.question.count({ where: { ssscId: leaf.id } });
      if (existingCount >= batchSize) {
        // Optionally mark as done
        await prisma.sssCategory.update({ where: { id: leaf.id }, data: { status: 'done' } });
        continue;
      }
      // Enqueue question generation for each leaf
      const payload: QuestionGenJob = { ssscId: leaf.id, targetCount: batchSize, overwrite: false };
      await questionGenQueue.add('generate-sssc', payload, { jobId: `sched:${leaf.id}` });
      // Mark as generating
      await prisma.sssCategory.update({ where: { id: leaf.id }, data: { status: 'generating' } });
    }
  },
  { connection }
);

schedulerWorker.on('error', err => logger.error('Scheduler worker error', err));
