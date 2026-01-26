/**
 * Real-Time Status Endpoint (JSON)
 * 
 * Always returns JSON status of realtime service.
 * Client should check this before connecting to SSE.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check if eventBus is available
    let mode: "enabled" | "disabled" = "enabled";
    let reason: string | undefined;

    try {
      const { eventBus } = await import("@/lib/eventBus");
      if (!eventBus) {
        mode = "disabled";
        reason = "eventBus not available";
      }
    } catch (err) {
      mode = "disabled";
      reason = "eventBus initialization failed";
    }

    return NextResponse.json({
      ok: true,
      mode,
      reason,
      updatedAt: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      mode: "disabled" as const,
      reason: "status check failed",
      updatedAt: new Date().toISOString(),
    }, { status: 200 });
  }
}
