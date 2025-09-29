import { Queue, QueueEvents, JobOptions } from 'bullmq';
import { connection } from './connection';

const queueName = 'question-gen';

const defaultOpts: JobOptions = {
  removeOnComplete: true,
  removeOnFail: 100,
};

const questionGenQueue = new Queue(queueName, {
  connection,
  defaultJobOptions: defaultOpts,
});

const questionGenEvents = new QueueEvents(queueName, { connection });

export { questionGenQueue, questionGenEvents };
