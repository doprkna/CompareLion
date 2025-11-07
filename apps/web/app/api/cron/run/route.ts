/**
 * Unified Cron Runner API (v0.29.21)
 * 
 * POST /api/cron/run
 * Trigger a registered cron job manually (admin only)
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { runCronJob, getRegisteredJobs } from '@/lib/cron/cron';
import { z } from 'zod';

const RunJobSchema = z.object({
  jobKey: z.string().min(1),
});

/**
 * POST /api/cron/run
 * Run a cron job manually (admin only)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Check admin auth or cron token
  const token = req.headers.get('x-cron-token');
  const auth = await requireAdmin(req);

  if (!token && (!auth.success || !auth.user)) {
    return unauthorizedError('Admin or cron token required');
  }

  const body = await req.json().catch(() => ({}));
  const validation = RunJobSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { jobKey } = validation.data;

  // Run the job
  const result = await runCronJob(jobKey);

  return successResponse({
    success: result.success,
    jobKey,
    durationMs: result.durationMs,
    error: result.error || undefined,
    message: result.success
      ? `Job ${jobKey} completed successfully`
      : `Job ${jobKey} failed: ${result.error}`,
  });
});

/**
 * GET /api/cron/run
 * List all registered cron jobs
 */
export const GET = safeAsync(async (_req: NextRequest) => {
  const auth = await requireAdmin(_req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  const jobs = getRegisteredJobs();
  return successResponse({
    jobs: jobs.map((j) => ({
      key: j.key,
      schedule: j.schedule,
      description: j.description,
    })),
  });
});

