/**
 * Analytics & Metrics
 * Lightweight event tracking system for beta
 * v0.14.0 - Telemetry & Monitoring
 */
import { logger } from '@/lib/logger';
import { getFlags } from '@parel/core/config/flags';
// In-memory event queue (max 100 events before auto-flush)
let eventQueue = [];
const MAX_QUEUE_SIZE = 100;
const FLUSH_INTERVAL = 30000; // 30 seconds
// Check if analytics is enabled
function isAnalyticsEnabled() {
    if (typeof window === 'undefined') {
        // Server-side: use feature flags
        return getFlags().enableAnalytics;
    }
    // Client-side: check if enabled (could be injected at build time)
    return typeof window.__ENABLE_ANALYTICS !== 'undefined'
        ? window.__ENABLE_ANALYTICS
        : false;
}
/**
 * Detect device type from user agent
 */
function detectDeviceType(userAgent) {
    if (/mobile/i.test(userAgent))
        return 'mobile';
    if (/tablet|ipad/i.test(userAgent))
        return 'tablet';
    return 'desktop';
}
/**
 * Get user context (client-side only)
 */
function getUserContext() {
    if (typeof window === 'undefined') {
        return {};
    }
    const userAgent = navigator.userAgent;
    const sessionId = sessionStorage.getItem('analytics_session_id') ||
        Math.random().toString(36).substring(7);
    // Store session ID
    sessionStorage.setItem('analytics_session_id', sessionId);
    return {
        sessionId,
        deviceType: detectDeviceType(userAgent),
        // Region detection would require geo IP API, skip for now
    };
}
/**
 * Track an analytics event
 */
export async function trackEvent(name, data = {}) {
    if (!isAnalyticsEnabled()) {
        return;
    }
    const userContext = getUserContext();
    const event = {
        name,
        timestamp: Date.now(),
        userContext,
        data: {
            ...data,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : 'server',
        },
    };
    eventQueue.push(event);
    // Auto-flush if queue is full
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
        await flushEvents();
    }
}
/**
 * Flush all queued events to the server
 */
export async function flushEvents() {
    if (eventQueue.length === 0 || !isAnalyticsEnabled()) {
        return;
    }
    const eventsToSend = [...eventQueue];
    eventQueue = [];
    try {
        // Send to metrics API
        const response = await fetch('/api/metrics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ events: eventsToSend }),
        });
        if (!response.ok) {
            logger.error('[METRICS] Failed to send events', { status: response.statusText });
            // Re-queue events on failure (up to max size)
            eventQueue.push(...eventsToSend.slice(0, MAX_QUEUE_SIZE - eventQueue.length));
        }
    }
    catch (error) {
        logger.error('[METRICS] Error sending events', error);
        // Re-queue events on error
        eventQueue.push(...eventsToSend.slice(0, MAX_QUEUE_SIZE - eventQueue.length));
    }
}
/**
 * Initialize analytics (call on app start)
 */
export function initAnalytics() {
    if (typeof window === 'undefined' || !isAnalyticsEnabled()) {
        return;
    }
    // Track app start
    trackEvent('app_start', {
        platform: 'web',
        timestamp: Date.now(),
    });
    // Set up periodic flush
    setInterval(flushEvents, FLUSH_INTERVAL);
    // Flush on page unload
    window.addEventListener('beforeunload', () => {
        // Use sendBeacon for reliability during unload
        if (eventQueue.length > 0) {
            navigator.sendBeacon('/api/metrics', JSON.stringify({ events: eventQueue }));
            eventQueue = [];
        }
    });
}
/**
 * Get current queue size (for debugging)
 */
export function getQueueSize() {
    return eventQueue.length;
}
/**
 * Clear event queue (for testing)
 */
export function clearQueue() {
    eventQueue = [];
}
/**
 * Get flow metrics (stub for build safety)
 */
export async function getFlowMetrics() {
    return { flows: 0, users: 0, questionsAnswered: 0 };
}
/**
 * Log flow event (stub for build safety)
 */
export async function logFlowEvent(event, data) {
    return { ok: true, event, logged: Date.now() };
}
