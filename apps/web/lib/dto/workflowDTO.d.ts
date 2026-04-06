import type { Workflow as PrismaWorkflow } from '@parel/db';
export declare function toWorkflowDTO(w: PrismaWorkflow): {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};
export type WorkflowDTO = ReturnType<typeof toWorkflowDTO>;
