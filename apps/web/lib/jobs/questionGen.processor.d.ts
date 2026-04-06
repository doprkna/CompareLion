import { Worker } from 'bullmq';
import type { Job } from 'bullmq';
export declare function processQuestionGenJob(job: Job): Promise<{
    skipped: boolean;
    reason: string;
    insertedCount?: undefined;
} | {
    insertedCount: number;
    skipped?: undefined;
    reason?: undefined;
}>;
export declare const questionGenWorker: Worker<any, {
    skipped: boolean;
    reason: string;
    insertedCount?: undefined;
} | {
    insertedCount: number;
    skipped?: undefined;
    reason?: undefined;
}, string>;
