/**
 * Real-Time Event System
 * Hybrid Redis pub/sub + local event bus. Falls back to local-only when Redis disabled.
 */
import { eventBus } from "@/lib/eventBus";
import { getRedisClient, hasRedis } from "@parel/redis";

const CHANNEL_NAME = "parel-events";

let redisPublisher: import("ioredis").default | null = null;
let redisSubscriber: import("ioredis").default | null = null;
let redisConnected = false;

function initializeRedis() {
  if (typeof window !== "undefined") return;
  if (!hasRedis) return;

  const client = getRedisClient();
  if (!client) return;

  try {
    redisPublisher = client;
    redisSubscriber = client.duplicate();

    redisSubscriber.subscribe(CHANNEL_NAME, (err) => {
      if (err) redisConnected = false;
      else redisConnected = true;
    });

    redisSubscriber.on("message", (channel, message) => {
      if (channel !== CHANNEL_NAME) return;
      try {
        const { event, payload } = JSON.parse(message);
        eventBus.emit(event, payload);
      } catch {}
    });

    redisSubscriber.on("connect", () => { redisConnected = true; });
    redisSubscriber.on("error", () => { redisConnected = false; });
    redisPublisher.on("connect", () => { redisConnected = true; });
    redisPublisher.on("error", () => { redisConnected = false; });
  } catch {
    redisPublisher = null;
    redisSubscriber = null;
    redisConnected = false;
  }
}

export async function publishEvent(event: string, payload: any) {
  if (!redisConnected && typeof process !== "undefined") {
    initializeRedis();
  }

  eventBus.emit(event, payload);

  if (redisPublisher && redisConnected) {
    try {
      await redisPublisher.publish(CHANNEL_NAME, JSON.stringify({ event, payload }));
    } catch {}
  }
}

export function isRedisConnected(): boolean {
  return redisConnected;
}

export async function disconnectRedis() {
  if (redisPublisher) await redisPublisher.quit();
  if (redisSubscriber) await redisSubscriber.quit();
  redisPublisher = null;
  redisSubscriber = null;
  redisConnected = false;
}

if (typeof process !== "undefined") {
  process.on("SIGTERM", disconnectRedis);
  process.on("SIGINT", disconnectRedis);
}
