import { Queue } from 'bullmq';

export type QuestionGenJob = {
  ssscId: string;
  targetCount?: number;  // default 10
  overwrite?: boolean;   // default false
  model?: string;        // env fallback
};

let _questionGenQueue: Queue<QuestionGenJob> | null = null;

function getQuestionGenQueue(): Queue<QuestionGenJob> | null {
  if (!_questionGenQueue && process.env.REDIS_HOST && process.env.REDIS_PORT) {
    _questionGenQueue = new Queue<QuestionGenJob>('question-gen', {
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
  }
  return _questionGenQueue;
}

export const questionGenQueue = new Proxy({} as Queue<QuestionGenJob> | null, {
  get(_target, prop) {
    const queue = getQuestionGenQueue();
    if (!queue) return undefined;
    const value = (queue as any)[prop];
    return typeof value === 'function' ? value.bind(queue) : value;
  },
  set(_target, prop, value) {
    const queue = getQuestionGenQueue();
    if (queue) {
      (queue as any)[prop] = value;
    }
    return true;
  }
}) as Queue<QuestionGenJob> | null;
