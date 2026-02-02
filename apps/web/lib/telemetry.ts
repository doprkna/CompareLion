export function logEvent(event: string, data?: any): void {
  // Telemetry stub
}

/** Telemetry event names (for type-safe usage). */
export const TelemetryEvents = {
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',
} as const;
export type TelemetryEvents = (typeof TelemetryEvents)[keyof typeof TelemetryEvents];