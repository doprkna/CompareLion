import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authGuard";
import { prisma } from "@/lib/db";
import { createGlobalEvent, updateGlobalEvent, deactivateEvent } from "@/lib/events";

/**
 * GET /api/admin/events
 * Get all events (active and inactive)
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  try {
    const events = await prisma.globalEvent.findMany({
      orderBy: [
        { active: "desc" },
        { startAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("[API] Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Create a new global event
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  try {
    const body = await req.json();
    const {
      title,
      description,
      emoji,
      type,
      bonusType,
      bonusValue,
      targetScope,
      startAt,
      endAt,
    } = body;

    // Validation
    if (!title || !type || !bonusType || !bonusValue || !startAt || !endAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validTypes = ["xp_boost", "gold_boost", "karma_boost", "energy_boost", "special"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    const validBonusTypes = ["percentage", "flat", "multiplier"];
    if (!validBonusTypes.includes(bonusType)) {
      return NextResponse.json(
        { error: "Invalid bonus type" },
        { status: 400 }
      );
    }

    const event = await createGlobalEvent({
      title,
      description,
      emoji: emoji || "🎉",
      type,
      bonusType,
      bonusValue: parseInt(bonusValue),
      targetScope: targetScope || "all",
      startAt: new Date(startAt),
      endAt: new Date(endAt),
    });

    return NextResponse.json({
      success: true,
      event,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("[API] Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/events
 * Update an existing event
 */
export async function PATCH(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  try {
    const body = await req.json();
    const { eventId, action, ...updates } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId required" },
        { status: 400 }
      );
    }

    if (action === "deactivate") {
      await deactivateEvent(eventId);
      return NextResponse.json({
        success: true,
        message: "Event deactivated",
      });
    }

    if (action === "activate") {
      await updateGlobalEvent(eventId, { active: true });
      return NextResponse.json({
        success: true,
        message: "Event activated",
      });
    }

    // Update event fields
    const event = await updateGlobalEvent(eventId, updates);

    return NextResponse.json({
      success: true,
      event,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("[API] Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events
 * Delete an event
 */
export async function DELETE(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId required" },
        { status: 400 }
      );
    }

    await prisma.globalEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted",
    });
  } catch (error) {
    console.error("[API] Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}













