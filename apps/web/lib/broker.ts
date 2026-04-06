/**
 * Unified Event Broker - local EventEmitter + Redis pub/sub when enabled.
 */
import { EventEmitter } from "events";
import { logger } from "@/lib/logger";
import { getRedisClient, hasRedis } from "@parel/redis";

const localEmitter = new EventEmitter();
localEmitter.setMaxListeners(100);

const REDIS_CHANNEL = "parel-events";

let redisPublisher: import("ioredis").default | null = null;
let redisSubscriber: import("ioredis").default | null = null;
let redisConnected = false;

function initRedis() {
  if (!hasRedis) return;
  const client = getRedisClient();
  if (!client) return;

  try {
    redisPublisher = client;
    redisSubscriber = client.duplicate();

    redisSubscriber.subscribe(REDIS_CHANNEL, () => { redisConnected = true; });
    redisSubscriber.on("message", (_, message) => {
      try {
        const { event, payload, metadata } = JSON.parse(message);
        localEmitter.emit(event, payload, metadata);
      } catch (err) {
        logger.error("[Broker] Failed to parse Redis message", err);
      }
    });
    redisPublisher.on("error", () => { redisConnected = false; });
    redisSubscriber.on("error", () => { redisConnected = false; });
  } catch {
    redisPublisher = null;
    redisSubscriber = null;
    redisConnected = false;
  }
}

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

const eventStats: Record<string, { count: number; failures: number; avgTime: number }> = {};
const failedEvents: Array<{ event: string; error: string; timestamp: Date }> = [];
const MAX_RETRIES = 3;

export async function publish(
  event: AppEvent | string,
  payload: any,
  options: { critical?: boolean; retries?: number } = {}
): Promise<void> {
  if (!redisConnected && typeof process !== "undefined") {
    initRedis();
  }

  const metadata: EventMetadata = {
    critical: options.critical || false,
    retries: 0,
    timestamp: Date.now(),
  };

  localEmitter.emit(event, payload, metadata);

  if (redisConnected && redisPublisher) {
    try {
      await redisPublisher.publish(
        REDIS_CHANNEL,
        JSON.stringify({ event, payload, metadata })
      );
    } catch (error: any) {
      logger.error("[Broker] Publish failed", { event, message: error.message });
      if (options.critical && (metadata.retries || 0) < MAX_RETRIES) {
        metadata.retries = (metadata.retries || 0) + 1;
        await new Promise((r) => setTimeout(r, 1000 * (metadata.retries ?? 0)));
        return publish(event, payload, { ...options, retries: metadata.retries });
      }
    }
  }

  if (!eventStats[event]) eventStats[event] = { count: 0, failures: 0, avgTime: 0 };
  eventStats[event].count++;
}

export function subscribe(
  event: AppEvent | string,
  handler: (payload: any, metadata?: EventMetadata) => void
): () => void {
  localEmitter.on(event, handler);
  return () => localEmitter.off(event, handler);
}

export function getEventStats() {
  return { stats: eventStats, failedEvents: failedEvents.slice(0, 20), redisConnected };
}

export function clearEventStats() {
  Object.keys(eventStats).forEach((k) => delete eventStats[k]);
  failedEvents.length = 0;
}
