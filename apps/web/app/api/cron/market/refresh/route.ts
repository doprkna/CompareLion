import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, unauthorizedError, successResponse } from "@/lib/api-handler";

/**
 * POST /api/cron/market/refresh
 * Rotates event items weekly or seasonally
 * For MVP, marks expired event items as inactive (future: hide them)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get("x-cron-token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError("Invalid token");
  }

  // For MVP, just log refresh
  // Future: Check active season/event and update isEventItem status
  
  // Get all event items
  const eventItems = await prisma.marketItem.findMany({
    where: {
      isEventItem: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return successResponse({
    success: true,
    eventItemsChecked: eventItems.length,
    message: "Market refresh completed",
    note: "Event item rotation logic pending (tied to season cron)",
  });
});




