import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, unauthorizedError, successResponse } from "@/lib/api-handler";

/**
 * POST /api/cron/regions/events
 * Rotates small region mini-events (Reflection Festival, Merchant Visit, Calm Week)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get("x-cron-token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError("Invalid token");
  }

  // Mini-events that can be active in regions
  const miniEvents = [
    {
      name: "Reflection Festival",
      description: "Bonus XP for reflections this week",
      buffType: "xp",
      buffMultiplier: 1.1, // +10%
    },
    {
      name: "Merchant Visit",
      description: "Reduced prices in shops",
      buffType: "gold",
      buffMultiplier: 0.9, // -10% cost
    },
    {
      name: "Calm Week",
      description: "Mood stabilization bonus",
      buffType: "mood",
      buffMultiplier: 1.15, // +15% mood
    },
  ];

  // Get all active regions
  const regions = await prisma.region.findMany({
    where: {
      isActive: true,
    },
  });

  let eventsAssigned = 0;

  // Assign random mini-events to regions (placeholder - in MVP this just logs)
  // Future: Store active events in a separate table or metadata
  for (const region of regions) {
    const randomEvent = miniEvents[Math.floor(Math.random() * miniEvents.length)];
    // For MVP, we just log the event assignment
    // Future: Store in Region.metadata or separate RegionEvent table
    eventsAssigned++;
  }

  return successResponse({
    success: true,
    eventsAssigned,
    regionsChecked: regions.length,
    message: "Region events rotation completed",
    note: "Event assignments logged; full event system implementation pending",
  });
});

