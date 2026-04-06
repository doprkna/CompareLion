import { Worker } from 'bullmq';
export declare const worker: Worker<{
    ssscId: number;
    runVersion?: string;
}, any, string>;
