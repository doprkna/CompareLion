import { Queue, QueueEvents, JobsOptions } from 'bullmq';
import { connection } from './connection';

const queueName = 'question-gen';

const defaultOpts: JobsOptions = {
  removeOnComplete: true,
  removeOnFail: 100,
};

let _questionGenQueue: Queue | null = null;
let _questionGenEvents: QueueEvents | null = null;

function getQuestionGenQueue(): Queue | null {
  if (!_questionGenQueue) {
    // Access connection proxy to trigger lazy init
    const conn = (connection as any);
    if (conn) {
      _questionGenQueue = new Queue(queueName, {
        connection: conn,
        defaultJobOptions: defaultOpts,
      });
    }
  }
  return _questionGenQueue;
}

function getQuestionGenEvents(): QueueEvents | null {
  if (!_questionGenEvents) {
    const conn = (connection as any);
    if (conn) {
      _questionGenEvents = new QueueEvents(queueName, { connection: conn });
    }
  }
  return _questionGenEvents;
}

const questionGenQueue = new Proxy({} as Queue | null, {
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
}) as Queue | null;

const questionGenEvents = new Proxy({} as QueueEvents | null, {
  get(_target, prop) {
    const events = getQuestionGenEvents();
    if (!events) return undefined;
    const value = (events as any)[prop];
    return typeof value === 'function' ? value.bind(events) : value;
  },
  set(_target, prop, value) {
    const events = getQuestionGenEvents();
    if (events) {
      (events as any)[prop] = value;
    }
    return true;
  }
}) as QueueEvents | null;

export { questionGenQueue, questionGenEvents };
