/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Metrics API
 * Aggregated analytics data
 * v0.13.2n - Community Growth (extended with growth tracking)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, forbiddenError, successResponse } from '@/lib/api-handler';

// In-memory storage for metrics (in production, use Redis or database)
const metricsStore: Array<{
  name: string;
  timestamp: number;
  data: any;
}> = [];

/**
 * GET /api/admin/metrics
 * Get aggregated metrics (admin only)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  // Get user and check admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
    return forbiddenError();
  }

  // Aggregate events by type
  const eventsByType: { [key: string]: number } = {
    app_start: 0,
    question_answered: 0,
    feedback_submitted: 0,
    error_occurred: 0,
    // Community Growth Events (v0.13.2n)
    share_clicked: 0,
    invite_generated: 0,
    challenge_completed: 0,
  };

  metricsStore.forEach(event => {
    if (eventsByType[event.name] !== undefined) {
      eventsByType[event.name]++;
    } else {
      eventsByType[event.name] = 1;
    }
  });

  // Get total event count
  const totalEvents = metricsStore.length;

  // Get recent events (last 100)
  const recentEvents = metricsStore.slice(-100).reverse();

  // Get additional metrics from database
  const [totalUsers, totalQuestions, feedbackCount] = await Promise.all([
    prisma.user.count(),
    prisma.flowAnswer.count(),
    prisma.feedbackSubmission.count(),
  ]);

  return successResponse({
    data: {
      totalEvents,
      eventsByType,
      recentEvents,
      database: {
        totalUsers,
        totalQuestions,
        feedbackCount,
      },
    },
  });
});

/**
 * POST /api/admin/metrics
 * Store metrics events (called from /api/metrics)
 * Note: This is an internal API, not directly called by clients
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json();
  const { events } = body;

  if (Array.isArray(events)) {
    // Store events in memory (limit to last 1000 events)
    metricsStore.push(...events);
    
    // Keep only last 1000 events to prevent memory issues
    if (metricsStore.length > 1000) {
      metricsStore.splice(0, metricsStore.length - 1000);
    }
  }

  return successResponse({
    received: events?.length || 0,
    total: metricsStore.length,
  });
});

