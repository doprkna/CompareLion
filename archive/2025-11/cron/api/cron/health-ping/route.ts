/**
 * Health Ping Cron Job (v0.14.0)
 * 
 * This endpoint is called every 5 minutes by Vercel Cron
 * to monitor application health and log metrics.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError } from '@/lib/api-handler';
import { logger } from '@parel/core/utils/debug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = safeAsync(async (req: NextRequest) => {
  // Verify this is a cron request
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return unauthorizedError('Unauthorized');
  }

  const startTime = Date.now();
  
  // Check database
  let dbHealthy = false;
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbHealthy = true;
  } catch (error) {
    logger.error('[HealthPing] Database check failed', error);
  }

  // Get error counts
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [criticalErrors, totalErrors] = await Promise.all([
    prisma.errorLog.count({
      where: {
        severity: 'critical',
        resolved: false,
        createdAt: { gte: oneHourAgo },
      },
    }),
    prisma.errorLog.count({
      where: {
        resolved: false,
        createdAt: { gte: oneHourAgo },
      },
    }),
  ]);

  const duration = Date.now() - startTime;

  // Log health ping metrics
  logger.info('[HealthPing]', {
    timestamp: new Date().toISOString(),
    dbHealthy,
    dbLatency,
    criticalErrors,
    totalErrors,
    duration,
  });

  return successResponse({
    checks: {
      database: {
        healthy: dbHealthy,
        latencyMs: dbLatency,
      },
      errors: {
        critical: criticalErrors,
        total: totalErrors,
      },
    },
    duration,
  });
});

