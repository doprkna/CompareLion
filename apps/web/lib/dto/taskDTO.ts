import type { Task as PrismaTask } from '@parel/db/src/client';

export function toTaskDTO(t: PrismaTask): {
  id: string;
  workflowId: string;
  label: string;
  status: string;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: t.id,
    workflowId: t.assigneeId ?? '',
    label: t.title,
    status: t.status,
    assignedTo: t.assigneeId ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export type TaskDTO = ReturnType<typeof toTaskDTO>;
