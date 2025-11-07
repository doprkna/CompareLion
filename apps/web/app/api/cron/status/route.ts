/**
 * Cron Job Status API (v0.29.21)
 * 
 * GET /api/cron/status
 * Get status of all cron jobs (admin only)
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getRegisteredJobs, getJobStatus } from '@/lib/cron/cron';

export const GET = safeAsync(async (_req: NextRequest) => {
  const auth = await requireAdmin(_req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  const jobs = getRegisteredJobs();
  const jobsWithStatus = await Promise.all(
    jobs.map(async (job) => {
      const status = await getJobStatus(job.key);
      return {
        key: job.key,
        schedule: job.schedule,
        description: job.description,
        ...status,
      };
    })
  );

  return successResponse({
    jobs: jobsWithStatus,
  });
});

