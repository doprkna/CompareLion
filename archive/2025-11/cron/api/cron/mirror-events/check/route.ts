import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * POST /api/cron/mirror-events/check
 * Activates/ends mirror events on schedule
 * Cron/admin only
 * v0.29.12 - Mirror Events
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();

  // Deactivate events that have ended
  const endedEvents = await prisma.mirrorEvent.updateMany({
    where: {
      active: true,
      endDate: { lt: now },
    },
    data: {
      active: false,
    },
  });

  // Activate events that should start
  const startedEvents = await prisma.mirrorEvent.updateMany({
    where: {
      active: false,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    data: {
      active: true,
    },
  });

  return successResponse({
    success: true,
    ended: endedEvents.count,
    started: startedEvents.count,
    message: `Processed ${endedEvents.count} ended and ${startedEvents.count} started events`,
  });
});

