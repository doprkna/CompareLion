import { prisma } from '@parel/db/src/client';

// Start a new job in the JobLog table
export async function startJob(ssscId: number, runVersion: string) {
  const idempotencyKey = `${ssscId}:${runVersion}`;
  return prisma.jobLog.create({
    data: {
      ssscId,
      runVersion,
      status: 'queued',
      idempotencyKey,
    },
  });
}

// Retrieve a job by its ID
export async function getJobLog(id: string) {
  return prisma.jobLog.findUnique({
    where: { id },
  });
}
