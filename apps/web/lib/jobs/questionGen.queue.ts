import { Queue } from 'bullmq';

export type QuestionGenJob = {
  ssscId: string;
  targetCount?: number;  // default 10
  overwrite?: boolean;   // default false
  model?: string;        // env fallback
};

export const questionGenQueue = new Queue<QuestionGenJob>('question-gen', {
  connection: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 500,
  },
});
