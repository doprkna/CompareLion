import type { FlowProgress as PrismaFlowProgress } from '@parel/db/src/client';

export function toSessionDTO(s: PrismaFlowProgress): {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  status: string;
} {
  return {
    id: s.id,
    userId: s.userId,
    startedAt: s.startedAt,
    endedAt: s.completedAt ?? null,
    status: s.completedAt ? 'expired' : 'active',
  };
}

export type SessionDTO = ReturnType<typeof toSessionDTO>;
