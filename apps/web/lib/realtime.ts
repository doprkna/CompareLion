/**
 * Real-Time Event System
 * 
 * Hybrid Redis pub/sub + local event bus for distributed real-time updates.
 * Automatically falls back to local-only mode if Redis is unavailable.
 * 
 * Architecture:
 * - Local: Node.js EventEmitter (in-process)
 * - Global: Redis pub/sub (cross-process/server)
 * - Fallback: Graceful degradation to local-only
 */

import { eventBus } from "@/lib/eventBus";
import Redis from "ioredis";
import { logger } from "@/lib/logger";
import { env, hasRedis } from "@/lib/env";

const REDIS_URL = env.REDIS_URL;
const CHANNEL_NAME = "parel-events";

// Redis clients (pub/sub require separate connections)
let redisPublisher: Redis | null = null;
let redisSubscriber: Redis | null = null;
let redisConnected = false;

/**
 * Initialize Redis pub/sub
 * Gracefully handles connection failures
 */
function initializeRedis() {
  if (typeof window !== "undefined") {
    // Client-side: Redis not available
    return;
  }

  if (!hasRedis || !REDIS_URL) {
    if (env.NODE_ENV === 'development') {
    }
    return;
  }

  try {
    // Publisher client
    redisPublisher = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn("Redis connection failed, using local event bus only");
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    });

    // Subscriber client (separate connection required)
    redisSubscriber = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn("Redis subscriber failed, using local event bus only");
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    });

    // Subscribe to event channel
    redisSubscriber.subscribe(CHANNEL_NAME, (err) => {
      if (err) {
        logger.error("Failed to subscribe to Redis channel", err);
        redisConnected = false;
      } else {
        logger.debug("Redis subscriber connected");
        redisConnected = true;
      }
    });

    // Handle incoming Redis messages
    redisSubscriber.on("message", (channel, message) => {
      if (channel !== CHANNEL_NAME) return;

      try {
        const { event, payload } = JSON.parse(message);
        
        // Emit to local event bus
        eventBus.emit(event, payload);
      } catch (err) {
        logger.error("Redis event parse error", err);
      }
    });

    // Connection events
    redisPublisher.on("connect", () => {
      redisConnected = true;
    });

    redisPublisher.on("error", (err) => {
      logger.warn("Redis publisher error", { message: err.message });
      redisConnected = false;
    });

    redisSubscriber.on("connect", () => {
      // Connected
    });

    redisSubscriber.on("error", (err) => {
      logger.warn("Redis subscriber error", { message: err.message });
      redisConnected = false;
    });

  } catch (err) {
    logger.warn("Redis initialization failed, using local event bus only", err);
    redisPublisher = null;
    redisSubscriber = null;
    redisConnected = false;
  }
}

// Redis initialization is now lazy - initializeRedis() will be called on first publishEvent

/**
 * Publish an event to both local and Redis
 * 
 * @param event Event name
 * @param payload Event data
 */
export async function publishEvent(event: string, payload: any) {
  // Lazy initialize Redis on first use
  if (!redisConnected && typeof process !== 'undefined') {
    initializeRedis();
  }
  
  // Always emit locally first (immediate)
  eventBus.emit(event, payload);

  // Attempt Redis pub/sub (global)
  if (redisPublisher && redisConnected) {
    try {
      const message = JSON.stringify({ event, payload });
      await redisPublisher.publish(CHANNEL_NAME, message);
    } catch (err) {
      logger.warn("Redis publish failed (falling back to local only)", err);
    }
  }
}

/**
 * Check if Redis is available
 */
export function isRedisConnected(): boolean {
  return redisConnected;
}

/**
 * Graceful shutdown
 */
export async function disconnectRedis() {
  if (redisPublisher) {
    await redisPublisher.quit();
  }
  if (redisSubscriber) {
    await redisSubscriber.quit();
  }
  redisConnected = false;
}

// Cleanup on process exit
if (typeof process !== "undefined") {
  process.on("SIGTERM", disconnectRedis);
  process.on("SIGINT", disconnectRedis);
}











