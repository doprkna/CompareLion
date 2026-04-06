import { Queue } from 'bullmq';
import { getRedisClient, hasRedis } from '@parel/redis';

export type QuestionGenJob = {
  ssscId: string;
  targetCount?: number;
  overwrite?: boolean;
  model?: string;
};

let _questionGenQueue: Queue<QuestionGenJob> | null = null;

function getQuestionGenQueue(): Queue<QuestionGenJob> | null {
  if (!hasRedis) return null;
  if (!_questionGenQueue) {
    const conn = getRedisClient();
    if (conn) {
      _questionGenQueue = new Queue<QuestionGenJob>('question-gen', {
        connection: conn,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: 1000,
          removeOnFail: 500,
        },
      });
    }
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
