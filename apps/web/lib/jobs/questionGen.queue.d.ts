import { Queue } from 'bullmq';
export type QuestionGenJob = {
    ssscId: string;
    targetCount?: number;
    overwrite?: boolean;
    model?: string;
};
export declare const questionGenQueue: Queue<QuestionGenJob> | null;
