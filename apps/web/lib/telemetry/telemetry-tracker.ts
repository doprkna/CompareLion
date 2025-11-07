/**
 * Privacy-Safe Telemetry Tracker (v0.11.7)
 * 
 * Anonymous usage analytics with no personal data.
 */

import { prisma } from "@/lib/db/connection-pool";
import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";

/**
 * Event types
 */
export enum TelemetryEventType {
  PAGE_VIEW = "page_view",
  ACTION = "action",
  ERROR = "error",
  API_CALL = "api_call",
  SESSION_START = "session_start",
  SESSION_END = "session_end",
}

/**
 * Telemetry event data
 */
export interface TelemetryEventData {
  type: TelemetryEventType;
  page?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, any>;
  sessionId?: string;
}

/**
 * Get or create anonymous session ID
 */
export function getAnonymousSessionId(): string {
  // Use random UUID for anonymity
  // In client-side, this could be stored in sessionStorage
  return randomUUID();
}

/**
 * Anonymize page URL (remove sensitive data)
 */
export function anonymizeUrl(url: string): string {
  try {
    const parsed = new URL(url, "http://localhost");
    
    // Remove query parameters
    parsed.search = "";
    
    // Replace dynamic segments with placeholders
    let pathname = parsed.pathname;
    
    // Replace UUIDs
    pathname = pathname.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "[id]"
    );
    
    // Replace numeric IDs
    pathname = pathname.replace(/\/\d+/g, "/[id]");
    
    return pathname;
  } catch {
    return url;
  }
}

/**
 * Sanitize metadata (remove personal data)
 */
export function sanitizeMetadata(
  metadata: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    // Skip sensitive fields
    if (
      key.toLowerCase().includes("email") ||
      key.toLowerCase().includes("password") ||
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("secret") ||
      key.toLowerCase().includes("key")
    ) {
      continue;
    }
    
    // Include safe fields
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Track telemetry event
 */
export async function trackEvent(data: TelemetryEventData): Promise<void> {
  try {
    // Don't track in development (unless explicitly enabled)
    if (process.env.NODE_ENV === "development" && process.env.TELEMETRY_ENABLED !== "true") {
      return;
    }
    
    // Anonymize and sanitize
    const anonymizedPage = data.page ? anonymizeUrl(data.page) : undefined;
    const sanitizedMetadata = data.metadata
      ? sanitizeMetadata(data.metadata)
      : undefined;
    
    // Detect platform
    const platform = data.metadata?.userAgent?.includes("Mobile") ? "mobile" : "web";
    
    // Store event
    await prisma.telemetryEvent.create({
      data: {
        type: data.type,
        page: anonymizedPage,
        action: data.action,
        duration: data.duration,
        metadata: sanitizedMetadata,
        sessionId: data.sessionId,
        userAgent: data.metadata?.userAgent,
        platform,
      },
    });
  } catch (error) {
    // Silently fail - telemetry should never break the app
    logger.warn("[Telemetry] Failed to track event", error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(page: string, sessionId: string) {
  await trackEvent({
    type: TelemetryEventType.PAGE_VIEW,
    page,
    sessionId,
  });
}

/**
 * Track action
 */
export async function trackAction(
  action: string,
  page: string,
  duration?: number,
  metadata?: Record<string, any>
) {
  await trackEvent({
    type: TelemetryEventType.ACTION,
    page,
    action,
    duration,
    metadata,
  });
}

/**
 * Track error
 */
export async function trackError(
  errorType: string,
  page: string,
  metadata?: Record<string, any>
) {
  await trackEvent({
    type: TelemetryEventType.ERROR,
    page,
    action: errorType,
    metadata,
  });
}

/**
 * Track API call
 */
export async function trackApiCall(
  endpoint: string,
  duration: number,
  statusCode: number
) {
  await trackEvent({
    type: TelemetryEventType.API_CALL,
    page: anonymizeUrl(endpoint),
    duration,
    metadata: { statusCode },
  });
}

/**
 * Track session start
 */
export async function trackSessionStart(sessionId: string) {
  await trackEvent({
    type: TelemetryEventType.SESSION_START,
    sessionId,
  });
}

/**
 * Track session end
 */
export async function trackSessionEnd(sessionId: string, duration: number) {
  await trackEvent({
    type: TelemetryEventType.SESSION_END,
    sessionId,
    duration,
  });
}

/**
 * Clean up old telemetry data (retention: 30 days)
 */
export async function cleanupOldTelemetry(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  try {
    const result = await prisma.telemetryEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    
    return result.count;
  } catch (error) {
    logger.error("[Telemetry] Failed to cleanup old data", error);
    return 0;
  }
}













