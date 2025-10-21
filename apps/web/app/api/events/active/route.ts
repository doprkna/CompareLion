import { NextRequest, NextResponse } from "next/server";
import { getActiveEvents, getEventDisplayInfo, getTimeRemaining } from "@/lib/events";

/**
 * GET /api/events/active
 * Get all currently active global events
 */
export async function GET(req: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      count: formattedEvents.length,
    });
  } catch (error) {
    console.error("[API Error][events/active]", error);
    return NextResponse.json(
      { error: "Failed to fetch active events" },
      { status: 500 }
    );
  }
}



