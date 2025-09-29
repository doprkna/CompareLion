import type { FlowProgress as PrismaFlowProgress } from '@parel/db/src/client';

export function toFlowDTO(f: PrismaFlowProgress & { flow?: { name?: string } }): {
  id: string;
  userId: string;
  type: string;
  state: string;
  createdAt: Date;
} {
  return {
    id: f.id,
    userId: f.userId,
    type: f.flow?.name ?? '',
    state: JSON.stringify({ currentStepId: f.currentStepId }),
    createdAt: f.startedAt,
  };
}

export type FlowDTO = ReturnType<typeof toFlowDTO>;
