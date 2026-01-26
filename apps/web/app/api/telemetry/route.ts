import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/db';
import { logger } from '@parel/core/utils/debug';
import { safeAsync, successResponse, errorResponse, authError, forbiddenError } from '@/lib/api-handler';

interface TelemetryEvent {
  userId: string;
  event: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

/**
 * POST /api/telemetry
 * Receive batched telemetry events
 */
export const POST = safeAsync(async (request: NextRequest) => {
  const body = await request.json();
  const { events } = body as { events: TelemetryEvent[] };

  if (!Array.isArray(events) || events.length === 0) {
    return errorResponse('Invalid events data', 400, 'VALIDATION_ERROR');
  }

  // Store events in database
  const eventLogs = await Promise.allSettled(
    events.map(async (event) => {
      try {
        // Check if user exists and has analytics enabled
        const user = await prisma.user.findUnique({
          where: { id: event.userId },
          select: { 
            id: true,
          },
        });

        if (!user) {
          logger.warn('[Telemetry] User not found', { userId: event.userId });
          return null;
        }

        // Store in EventLog table
        return await prisma.eventLog.create({
          data: {
            userId: event.userId,
            eventType: event.event,
            eventData: event.metadata ? JSON.stringify(event.metadata) : null,
            timestamp: event.timestamp || new Date(),
          },
        });
      } catch (error) {
        logger.error('[Telemetry] Event log error', error);
        return null;
      }
    })
  );

  const successCount = eventLogs.filter(r => r.status === 'fulfilled' && r.value).length;

  logger.info('[Telemetry] Stored events', { successCount, total: events.length });

  return successResponse({
    stored: successCount,
    total: events.length,
  });
});

/**
 * GET /api/telemetry
 * Get telemetry summary (admin only)
 */
export const GET = safeAsync(async (_request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return authError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    return forbiddenError('Admin access required');
  }

  // Get telemetry summary
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalEvents,
    events24h,
    events7d,
    eventTypes,
  ] = await Promise.all([
    prisma.eventLog.count(),
    prisma.eventLog.count({
      where: { timestamp: { gte: last24Hours } },
    }),
    prisma.eventLog.count({
      where: { timestamp: { gte: last7Days } },
    }),
    prisma.eventLog.groupBy({
      by: ['eventType'],
      _count: true,
      where: { timestamp: { gte: last7Days } },
      orderBy: { _count: { eventType: 'desc' } },
      take: 10,
    }),
  ]);

  return successResponse({
    summary: {
      totalEvents,
      events24h,
      events7d,
    },
    topEvents: eventTypes.map(et => ({
      type: et.eventType,
      count: et._count,
    })),
  });
});
