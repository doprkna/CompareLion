import { Queue, QueueEvents } from 'bullmq';
declare const questionGenQueue: Queue | null;
declare const questionGenEvents: QueueEvents | null;
export { questionGenQueue, questionGenEvents };
