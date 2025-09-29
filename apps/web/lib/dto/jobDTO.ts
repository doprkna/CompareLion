import type { JobLog as PrismaJobLog } from '@parel/db/src/client';

export function toJobDTO(job: PrismaJobLog): {
  id: string;
  ssscId: string;
  status: string;
  error: string | null;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
} {
  return {
    id: job.id.toString(),
    ssscId: job.ssscId?.toString() || '',
    status: job.status,
    error: job.error ?? null,
    createdAt: job.createdAt,
    startedAt: job.startedAt ?? null,
    finishedAt: job.finishedAt ?? null,
  };
}

export type JobDTO = ReturnType<typeof toJobDTO>;
