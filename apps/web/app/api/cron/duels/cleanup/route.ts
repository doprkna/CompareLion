import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, unauthorizedError, successResponse } from "@/lib/api-handler";

/**
 * POST /api/cron/duels/cleanup
 * Expires unfinished duels older than 24 hours
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get("x-cron-token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError("Invalid token");
  }

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Find duels that are pending or active and older than 24 hours
  const expiredDuels = await prisma.socialDuel.findMany({
    where: {
      status: {
        in: ["pending", "active"],
      },
      createdAt: {
        lt: twentyFourHoursAgo,
      },
    },
    select: {
      id: true,
    },
  });

  // Mark them as expired
  const result = await prisma.socialDuel.updateMany({
    where: {
      id: { in: expiredDuels.map((d) => d.id) },
    },
    data: {
      status: "expired",
    },
  });

  return successResponse({
    success: true,
    expired: result.count,
    message: "Duel cleanup completed",
  });
});

