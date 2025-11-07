import { NextRequest, NextResponse } from "next/server";
import { getActiveEvents, getEventDisplayInfo, getTimeRemaining } from "@/lib/events";
import { safeAsync, successResponse } from "@/lib/api-handler";

/**
 * GET /api/events/active
 * Get all currently active global events
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const events = await getActiveEvents();

  const formattedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    emoji: event.emoji || "🎉",
    type: event.type,
    bonusType: event.bonusType,
    bonusValue: event.bonusValue,
    targetScope: event.targetScope,
    startAt: event.startAt,
    endAt: event.endAt,
    timeRemaining: getTimeRemaining(event.endAt),
    displayInfo: getEventDisplayInfo(event),
  }));

  return successResponse({
    events: formattedEvents,
    count: formattedEvents.length,
  });
});



