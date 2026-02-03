/**
 * Privacy-Safe Telemetry Tracker (v0.11.7)
 *
 * Anonymous usage analytics with no personal data.
 */
/**
 * Event types
 */
export declare enum TelemetryEventType {
    PAGE_VIEW = "page_view",
    ACTION = "action",
    ERROR = "error",
    API_CALL = "api_call",
    SESSION_START = "session_start",
    SESSION_END = "session_end"
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
export declare function getAnonymousSessionId(): string;
/**
 * Anonymize page URL (remove sensitive data)
 */
export declare function anonymizeUrl(url: string): string;
/**
 * Sanitize metadata (remove personal data)
 */
export declare function sanitizeMetadata(metadata: Record<string, any>): Record<string, any>;
/**
 * Track telemetry event
 */
export declare function trackEvent(data: TelemetryEventData): Promise<void>;
/**
 * Track page view
 */
export declare function trackPageView(page: string, sessionId: string): Promise<void>;
/**
 * Track action
 */
export declare function trackAction(action: string, page: string, duration?: number, metadata?: Record<string, any>): Promise<void>;
/**
 * Track error
 */
export declare function trackError(errorType: string, page: string, metadata?: Record<string, any>): Promise<void>;
/**
 * Track API call
 */
export declare function trackApiCall(endpoint: string, duration: number, statusCode: number): Promise<void>;
/**
 * Track session start
 */
export declare function trackSessionStart(sessionId: string): Promise<void>;
/**
 * Track session end
 */
export declare function trackSessionEnd(sessionId: string, duration: number): Promise<void>;
/**
 * Clean up old telemetry data (retention: 30 days)
 */
export declare function cleanupOldTelemetry(daysToKeep?: number): Promise<number>;
