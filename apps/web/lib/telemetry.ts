/**
 * Telemetry & Analytics (v0.22.0)
 * Minimal event logging with privacy respect
 */

import { logger } from '@/lib/logger';

interface TelemetryEvent {
  userId: string;
  event: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

interface TelemetryBatch {
  events: TelemetryEvent[];
}

// In-memory batch queue
const eventQueue: TelemetryEvent[] = [];
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 30000; // 30 seconds

/**
 * Log a telemetry event
 * Events are batched and sent to /api/telemetry
 */
export async function logEvent(event: TelemetryEvent): Promise<void> {
  // Add timestamp if not provided
  if (!event.timestamp) {
    event.timestamp = new Date();
  }

  // Check user's privacy settings
  const allowAnalytics = await checkAnalyticsPermission(event.userId);
  if (!allowAnalytics) {
    logger.debug('[Telemetry] Analytics disabled for user', { userId: event.userId });
    return;
  }

  // Add to queue
  eventQueue.push(event);

  // Send immediately if batch size reached
  if (eventQueue.length >= BATCH_SIZE) {
    await flushEvents();
  }
}

/**
 * Check if user has analytics enabled
 */
async function checkAnalyticsPermission(userId: string): Promise<boolean> {
  try {
    // Check user's privacy settings
    // For now, default to true (opt-out model)
    // In production, check user.allowAnalytics flag
    return true;
  } catch (error) {
    logger.error('[Telemetry] Permission check error', error);
    return false;
  }
}

/**
 * Flush queued events to API
 */
export async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const eventsToSend = eventQueue.splice(0, eventQueue.length);

  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: eventsToSend }),
    });

    logger.info(`[Telemetry] Flushed ${eventsToSend.length} events`);
  } catch (error) {
    logger.error('[Telemetry] Flush error', error);
    // Re-add failed events to queue
    eventQueue.unshift(...eventsToSend);
  }
}

/**
 * Start automatic batch flushing
 */
export function startTelemetryBatching(): void {
  setInterval(() => {
    flushEvents();
  }, BATCH_INTERVAL);
}

/**
 * Client-side telemetry helper
 * Use this in React components
 */
export function useClientTelemetry() {
  const trackEvent = async (event: string, metadata?: Record<string, any>) => {
    try {
      await fetch('/api/telemetry/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, metadata }),
      });
    } catch (error) {
      logger.error('[Telemetry] Client track error', error);
    }
  };

  return { trackEvent };
}

/**
 * Common telemetry events
 */
export const TelemetryEvents = {
  // Auth
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTERED: 'user_registered',
  
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  
  // Reflection
  REFLECTION_GENERATED: 'reflection_generated',
  REFLECTION_SHARED: 'reflection_shared',
  REFLECTION_LIKED: 'reflection_liked',
  
  // Comparison
  COMPARISON_SUBMITTED: 'comparison_submitted',
  COMPARISON_VIEWED: 'comparison_viewed',
  
  // Shop/Economy
  ITEM_PURCHASED: 'item_purchased',
  GEMS_PURCHASED: 'gems_purchased',
  PURCHASE_STARTED: 'purchase_started',
  
  // Social
  MESSAGE_SENT: 'message_sent',
  FRIEND_ADDED: 'friend_added',
  COMMENT_POSTED: 'comment_posted',
  
  // Subscription
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  
  // Engagement
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  PAGE_VIEWED: 'page_viewed',
  FEATURE_ACCESSED: 'feature_accessed',
};

/**
 * Track page view (client-side)
 */
export function trackPageView(page: string, metadata?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  
  fetch('/api/telemetry/client', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: TelemetryEvents.PAGE_VIEWED,
      metadata: {
        page,
        ...metadata,
      },
    }),
  }).catch((err) => logger.error('Telemetry page view tracking failed', err));
}

/**
 * Track feature access
 */
export function trackFeatureAccess(feature: string, metadata?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  
  fetch('/api/telemetry/client', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: TelemetryEvents.FEATURE_ACCESSED,
      metadata: {
        feature,
        ...metadata,
      },
    }),
  }).catch((err) => logger.error('Telemetry feature tracking failed', err));
}

