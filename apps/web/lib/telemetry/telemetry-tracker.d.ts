/**
 * Telemetry tracker stub - minimal implementation for build resolution.
 */
export declare enum TelemetryEventType {
    page_view = "page_view",
    action = "action",
    click = "click",
    custom = "custom"
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
export declare function trackEvent(event: TelemetryEvent): Promise<void>;
