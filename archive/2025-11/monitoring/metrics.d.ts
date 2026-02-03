/**
 * Analytics & Metrics
 * Lightweight event tracking system for beta
 * v0.14.0 - Telemetry & Monitoring
 */
type EventName = 'app_start' | 'question_answered' | 'feedback_submitted' | 'error_occurred' | 'user_login' | 'page_error' | 'referral_completed';
interface UserContext {
    userId?: string;
    anonymousId?: string;
    sessionId?: string;
    deviceType?: string;
    region?: string;
}
interface EventData {
    [key: string]: any;
    userContext?: UserContext;
}
/**
 * Track an analytics event
 */
export declare function trackEvent(name: EventName, data?: EventData): Promise<void>;
/**
 * Flush all queued events to the server
 */
export declare function flushEvents(): Promise<void>;
/**
 * Initialize analytics (call on app start)
 */
export declare function initAnalytics(): void;
/**
 * Get current queue size (for debugging)
 */
export declare function getQueueSize(): number;
/**
 * Clear event queue (for testing)
 */
export declare function clearQueue(): void;
/**
 * Get flow metrics (stub for build safety)
 */
export declare function getFlowMetrics(): Promise<{
    flows: number;
    users: number;
    questionsAnswered: number;
}>;
/**
 * Log flow event (stub for build safety)
 */
export declare function logFlowEvent(event: string, data?: any): Promise<{
    ok: boolean;
    event: string;
    logged: number;
}>;
export {};
