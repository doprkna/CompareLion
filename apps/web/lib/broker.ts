/**
 * Unified Event Broker
 * 
 * Single interface for local EventEmitter + Redis pub/sub.
 * Replaces scattered realtime.ts and eventBus.ts.
 */

import { EventEmitter } from "events";
import Redis from "ioredis";

// Event types for type safety
export type AppEvent =
  | "message:new"
  | "achievement:unlock"
  | "xp:update"
  | "challenge:new"
  | "challenge:update"
  | "quest:completed"
  | "crafting:complete"
  | "market:sold"
  | "feed:new"
  | "group:created"
  | "archetype:evolved"
  | "event:created";

interface EventMetadata {
  retries?: number;
  critical?: boolean;
  timestamp?: number;
}

// Local emitter
const localEmitter = new EventEmitter();
localEmitter.setMaxListeners(100);

// Redis clients
let redisPublisher: Redis | null = null;
let redisSubscriber: Redis | null = null;
let redisConnected = false;

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_CHANNEL = "parel-events";
const MAX_RETRIES = 3;

// Event monitoring
const eventStats: Record<string, { count: number; failures: number; avgTime: number }> = {};
const failedEvents: Array<{ event: string; error: string; timestamp: Date }> = [];

/**
 * Initialize Redis connection
 */
function initRedis() {
  if (redisConnected) return;

  try {
    redisPublisher = new Redis(REDIS_URL);
    redisSubscriber = new Redis(REDIS_URL);

    redisSubscriber.subscribe(REDIS_CHANNEL, () => {
      console.log(`📡 Subscribed to ${REDIS_CHANNEL}`);
      redisConnected = true;
    });

    redisSubscriber.on("message", (_, message) => {
      try {
        const { event, payload, metadata } = JSON.parse(message);
        localEmitter.emit(event, payload, metadata);
      } catch (err) {
        console.error("[Broker] Failed to parse Redis message:", err);
      }
    });

    redisPublisher.on("error", (err) => {
      console.warn("[Broker] Redis publisher error:", err.message);
      redisConnected = false;
    });

    redisSubscriber.on("error", (err) => {
      console.warn("[Broker] Redis subscriber error:", err.message);
      redisConnected = false;
    });
  } catch (err) {
    console.warn("[Broker] Redis not available, using local-only mode");
    redisConnected = false;
  }
}

// Initialize on module load
initRedis();

/**
 * Publish event with retry logic
 */
export async function publish(
  event: AppEvent | string,
  payload: any,
  options: { critical?: boolean; retries?: number } = {}
): Promise<void> {
  const startTime = Date.now();
  const metadata: EventMetadata = {
    critical: options.critical || false,
    retries: 0,
    timestamp: Date.now(),
  };

  try {
    // Always emit locally
    localEmitter.emit(event, payload, metadata);

    // Publish to Redis if connected
    if (redisConnected && redisPublisher) {
      await redisPublisher.publish(
        REDIS_CHANNEL,
        JSON.stringify({ event, payload, metadata })
      );
    }

    // Track stats
    if (!eventStats[event]) {
      eventStats[event] = { count: 0, failures: 0, avgTime: 0 };
    }
    eventStats[event].count++;
    const duration = Date.now() - startTime;
    eventStats[event].avgTime =
      (eventStats[event].avgTime * (eventStats[event].count - 1) + duration) /
      eventStats[event].count;
  } catch (error: any) {
    console.error(`[Broker] Failed to publish ${event}:`, error.message);

    // Track failure
    if (!eventStats[event]) {
      eventStats[event] = { count: 0, failures: 0, avgTime: 0 };
    }
    eventStats[event].failures++;
    failedEvents.unshift({
      event,
      error: error.message,
      timestamp: new Date(),
    });
    if (failedEvents.length > 100) failedEvents.pop();

    // Retry critical events
    if (options.critical && (metadata.retries || 0) < MAX_RETRIES) {
      metadata.retries = (metadata.retries || 0) + 1;
      console.log(`[Broker] Retrying ${event} (attempt ${metadata.retries})`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * metadata.retries!));
      return publish(event, payload, { ...options, retries: metadata.retries });
    }

    throw error;
  }
}

/**
 * Subscribe to events
 */
export function subscribe(
  event: AppEvent | string,
  handler: (payload: any, metadata?: EventMetadata) => void
): () => void {
  localEmitter.on(event, handler);
  return () => localEmitter.off(event, handler);
}

/**
 * Get event stats (for monitoring)
 */
export function getEventStats() {
  return {
    stats: eventStats,
    failedEvents: failedEvents.slice(0, 20),
    redisConnected,
  };
}

/**
 * Clear event stats
 */
export function clearEventStats() {
  Object.keys(eventStats).forEach((key) => delete eventStats[key]);
  failedEvents.length = 0;
}










