/**
 * Telemetry API (v0.11.7)
 * 
 * Record and retrieve anonymized usage analytics.
 */

import { NextRequest, NextResponse } from "next/server";
import { trackEvent, TelemetryEventType } from "@/lib/telemetry/telemetry-tracker";
import { getAggregatedMetrics, getSummaryStats } from "@/lib/telemetry/telemetry-aggregator";

/**
 * GET - Retrieve aggregated metrics
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7", 10);
    const type = searchParams.get("type") || undefined;
    
    // Get summary stats
    const summary = await getSummaryStats(days);
    
    // Get detailed aggregates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const aggregates = await getAggregatedMetrics(startDate, new Date(), type);
    
    return NextResponse.json({
      summary,
      aggregates,
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Telemetry API] GET failed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch telemetry data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Record telemetry event
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { type, page, action, duration, metadata, sessionId } = body;
    
    // Validate required fields
    if (!type || !Object.values(TelemetryEventType).includes(type)) {
      return NextResponse.json(
        { error: "Invalid or missing event type" },
        { status: 400 }
      );
    }
    
    // Track event
    await trackEvent({
      type,
      page,
      action,
      duration,
      metadata,
      sessionId,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Telemetry API] POST failed:", error);
    return NextResponse.json(
      {
        error: "Failed to record telemetry event",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}










