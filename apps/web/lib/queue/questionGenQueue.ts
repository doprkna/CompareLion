import { Queue, QueueEvents, JobsOptions } from 'bullmq';
import { connection } from './connection';

const queueName = 'question-gen';

const defaultOpts: JobsOptions = {
  removeOnComplete: true,
  removeOnFail: 100,
};

const questionGenQueue = new Queue(queueName, {
  connection,
  defaultJobOptions: defaultOpts,
});

const questionGenEvents = new QueueEvents(queueName, { connection });

export { questionGenQueue, questionGenEvents };
