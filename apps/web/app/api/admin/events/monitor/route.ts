import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authGuard";
import { getEventStats, clearEventStats } from "@/lib/broker";

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  try {
    const stats = getEventStats();

    return NextResponse.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error("[API] Error fetching event stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult) return authResult;

  try {
    clearEventStats();
    return NextResponse.json({ success: true, message: "Stats cleared" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear stats" }, { status: 500 });
  }
}











