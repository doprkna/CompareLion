import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authGuard";
import { getSlowQueryStats, clearSlowQueryLogs } from "@/lib/db-monitor";
import { prisma } from "@/lib/db";

/**
 * GET /api/reports/db-performance
 * Get database performance metrics (admin only)
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  try {
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

    return NextResponse.json({
      success: true,
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
  } catch (error) {
    console.error("[API] Error fetching DB performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/db-performance
 * Clear slow query logs
 */
export async function DELETE(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  try {
    clearSlowQueryLogs();

    return NextResponse.json({
      success: true,
      message: "Slow query logs cleared",
    });
  } catch (error) {
    console.error("[API] Error clearing logs:", error);
    return NextResponse.json(
      { error: "Failed to clear logs" },
      { status: 500 }
    );
  }
}











