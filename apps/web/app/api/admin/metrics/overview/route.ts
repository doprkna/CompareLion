import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError } from "@/lib/api-handler";
import { cached } from "@/app/api/_cache";

/**
 * GET /api/admin/metrics/overview
 * Returns aggregated metrics for admin dashboard
 * Includes active users, reflections, transactions, and trends
 * Cached for 10 minutes
 * Admin-only auth required
 * v0.32.6 - Admin Metrics Dashboard
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "DEVOPS")) {
    return forbiddenError("Admin access required");
  }

  // Cache for 10 minutes
  const metricsData = await cached(
    "admin-metrics-overview",
    10 * 60 * 1000,
    async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Run all queries in parallel
      const [
        totalUsers,
        activeUsers,
        newUsersWeek,
        totalReflections,
        transactionsWeek,
        allUsers,
        recentTransactions,
      ] = await Promise.all([
        // Total users
        prisma.user.count(),
        // Active users (logged in within last 7 days)
        prisma.user.count({
          where: {
            lastActiveAt: {
              gte: weekAgo,
            },
          },
        }),
        // New users this week
        prisma.user.count({
          where: {
            createdAt: {
              gte: weekAgo,
            },
          },
        }),
        // Total reflections (assuming UserResponse table for reflections)
        prisma.userResponse.count(),
        // Transactions this week
        prisma.transaction.count({
          where: {
            createdAt: {
              gte: weekAgo,
            },
          },
        }),
        // All users for XP average
        prisma.user.findMany({
          select: {
            xp: true,
            createdAt: true,
          },
        }),
        // Get transactions for last 7 days with daily grouping
        prisma.transaction.findMany({
          where: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
          select: {
            createdAt: true,
          },
        }),
      ]);

      // Calculate average XP per user
      const totalXP = allUsers.reduce((sum, u) => sum + u.xp, 0);
      const avgXPPerUser = totalUsers > 0 ? totalXP / totalUsers : 0;

      // Generate 7-day trend data
      const dates: Date[] = [];
      const timestamps: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        dates.push(date);
        timestamps.push(date.toISOString().split("T")[0]);
      }

      // Calculate XP trend (average XP per day)
      const xpTrend: number[] = [];
      dates.forEach((date) => {
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        // Count users created up to this day
        const usersUpToDay = allUsers.filter(
          (u) => new Date(u.createdAt) <= dayEnd
        ).length;

        // Calculate total XP up to this day (approximate)
        const totalXPUpToDay = allUsers
          .filter((u) => new Date(u.createdAt) <= dayEnd)
          .reduce((sum, u) => sum + u.xp, 0);

        const avgXP = usersUpToDay > 0 ? totalXPUpToDay / usersUpToDay : 0;
        xpTrend.push(Math.round(avgXP));
      });

      // Calculate user trend (cumulative user count per day)
      const userTrend: number[] = [];
      dates.forEach((date) => {
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const usersUpToDay = allUsers.filter(
          (u) => new Date(u.createdAt) <= dayEnd
        ).length;

        userTrend.push(usersUpToDay);
      });

      return {
        activeUsers,
        newUsersWeek,
        totalReflections,
        transactionsWeek,
        avgXPPerUser: Math.round(avgXPPerUser),
        xpTrend,
        userTrend,
        timestamp: timestamps,
      };
    }
  );

  return successResponse({
    success: true,
    ...metricsData,
  });
});



