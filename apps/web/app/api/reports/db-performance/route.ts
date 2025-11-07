import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/authGuard";
import { getSlowQueryStats, clearSlowQueryLogs } from "@/lib/db-monitor";
import { prisma } from "@/lib/db";
import { safeAsync, successResponse } from "@/lib/api-handler";

/**
 * GET /api/reports/db-performance
 * Get database performance metrics (admin only)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  const slowQueryStats = getSlowQueryStats();

    // Get table counts
    const [
      userCount,
      messageCount,
      challengeCount,
      eventLogCount,
      activityCount,
      feedItemCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
      prisma.challenge.count(),
      prisma.eventLog.count().catch(() => 0), // May not exist yet
      prisma.activity.count(),
      prisma.globalFeedItem.count(),
    ]);

  return successResponse({
    slowQueries: slowQueryStats,
    tableCounts: {
      users: userCount,
      messages: messageCount,
      challenges: challengeCount,
      eventLogs: eventLogCount,
      activities: activityCount,
      feedItems: feedItemCount,
    },
    recommendations: [
      eventLogCount === 0 && activityCount > 0
        ? "Consider migrating Activity → EventLog for unified events"
        : null,
      slowQueryStats.count > 50
        ? "High number of slow queries detected - review indexes"
        : null,
      ].filter(Boolean),
  });
});

/**
 * DELETE /api/reports/db-performance
 * Clear slow query logs
 */
export const DELETE = safeAsync(async (req: NextRequest) => {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  clearSlowQueryLogs();

  return successResponse(undefined, 'Slow query logs cleared');
});













