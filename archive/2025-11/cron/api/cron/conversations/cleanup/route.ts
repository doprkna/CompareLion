import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, unauthorizedError, successResponse } from "@/lib/api-handler";

/**
 * POST /api/cron/conversations/cleanup
 * Purges reflection conversation entries older than 7 days
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get("x-cron-token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError("Invalid token");
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Delete conversations older than 7 days
  const result = await prisma.reflectionConversation.deleteMany({
    where: {
      createdAt: {
        lt: sevenDaysAgo,
      },
    },
  });

  return successResponse({
    success: true,
    deleted: result.count,
    cutoffDate: sevenDaysAgo.toISOString(),
    message: "Conversation cleanup completed",
  });
});

