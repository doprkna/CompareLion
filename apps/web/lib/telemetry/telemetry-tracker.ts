/**
 * Telemetry tracker stub - minimal implementation for build resolution.
 */

export enum TelemetryEventType {
  page_view = "page_view",
  action = "action",
  click = "click",
  custom = "custom",
}

export interface TelemetryEvent {
  type: TelemetryEventType;
  page?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  userId?: string;
  anonymousId?: string;
  deviceType?: string;
  region?: string;
}

export async function trackEvent(event: TelemetryEvent): Promise<void> {
  // Stub: no-op for build
  void event;
}
