import { Queue } from "bullmq";
export declare const runQueue: Queue | null;
export declare function enqueueRun(taskId: string, workflowId?: string): Promise<void>;
