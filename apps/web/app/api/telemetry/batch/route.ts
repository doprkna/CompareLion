/**
 * Batch Telemetry API (v0.14.0)
 * 
 * Handle burst telemetry events (up to 100 events at once).
 */

import { NextRequest, NextResponse } from "next/server";
import { trackEvent, TelemetryEventType } from "@/lib/telemetry/telemetry-tracker";
import { safeAsync, validationError } from "@/lib/api-handler";
import { logger } from '@parel/core/utils/debug";
import { z } from "zod";

const TelemetryEventSchema = z.object({
  type: z.nativeEnum(TelemetryEventType),
  page: z.string().optional(),
  action: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  deviceType: z.string().optional(),
  region: z.string().optional(),
});

const BatchRequestSchema = z.object({
  events: z.array(TelemetryEventSchema).max(100, "Maximum 100 events per batch"),
});

/**
 * POST - Record batch telemetry events
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json();
  
  // Validate request
  const validation = BatchRequestSchema.safeParse(body);
  
  if (!validation.success) {
    return validationError("Validation failed", validation.error.issues);
  }
  
  const { events } = validation.data;
  
  // Track events in parallel (with concurrency limit)
  const results = await Promise.allSettled(
    events.map(event => trackEvent({
      type: event.type,
      page: event.page,
      action: event.action,
      duration: event.duration,
      metadata: {
        ...event.metadata,
        userId: event.userId,
        anonymousId: event.anonymousId,
        deviceType: event.deviceType,
        region: event.region,
      },
      sessionId: event.sessionId,
    }))
  );
  
  // Count successes and failures
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  if (failed > 0) {
    logger.warn(`[Telemetry Batch] ${failed} events failed to track`);
  }
  
  return NextResponse.json({ 
    success: true,
    recorded: successful,
    failed,
    total: events.length,
    timestamp: new Date().toISOString(),
  });
});

