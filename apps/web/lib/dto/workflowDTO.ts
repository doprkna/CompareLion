import type { Workflow as PrismaWorkflow } from '@parel/db/src/client';

export function toWorkflowDTO(w: PrismaWorkflow): {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: w.id,
    name: w.name,
    status: w.isActive ? 'active' : 'inactive',
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  };
}

export type WorkflowDTO = ReturnType<typeof toWorkflowDTO>;
