/**
 * Telemetry & Analytics (v0.22.0)
 * Minimal event logging with privacy respect
 */
interface TelemetryEvent {
    userId: string;
    event: string;
    metadata?: Record<string, any>;
    timestamp?: Date;
}
/**
 * Log a telemetry event
 * Events are batched and sent to /api/telemetry
 */
export declare function logEvent(event: TelemetryEvent): Promise<void>;
/**
 * Flush queued events to API
 */
export declare function flushEvents(): Promise<void>;
/**
 * Start automatic batch flushing
 */
export declare function startTelemetryBatching(): void;
/**
 * Client-side telemetry helper
 * Use this in React components
 */
export declare function useClientTelemetry(): {
    trackEvent: (event: string, metadata?: Record<string, any>) => Promise<void>;
};
/**
 * Common telemetry events
 */
export declare const TelemetryEvents: {
    USER_LOGIN: string;
    USER_LOGOUT: string;
    USER_REGISTERED: string;
    ONBOARDING_STARTED: string;
    ONBOARDING_COMPLETED: string;
    ONBOARDING_SKIPPED: string;
    REFLECTION_GENERATED: string;
    REFLECTION_SHARED: string;
    REFLECTION_LIKED: string;
    COMPARISON_SUBMITTED: string;
    COMPARISON_VIEWED: string;
    ITEM_PURCHASED: string;
    GEMS_PURCHASED: string;
    PURCHASE_STARTED: string;
    MESSAGE_SENT: string;
    FRIEND_ADDED: string;
    COMMENT_POSTED: string;
    SUBSCRIPTION_STARTED: string;
    SUBSCRIPTION_UPGRADED: string;
    SUBSCRIPTION_CANCELLED: string;
    SESSION_STARTED: string;
    SESSION_ENDED: string;
    PAGE_VIEWED: string;
    FEATURE_ACCESSED: string;
};
/**
 * Track page view (client-side)
 */
export declare function trackPageView(page: string, metadata?: Record<string, any>): void;
/**
 * Track feature access
 */
export declare function trackFeatureAccess(feature: string, metadata?: Record<string, any>): void;
export {};
