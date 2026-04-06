/**
 * Unified Event Broker
 *
 * Single interface for local EventEmitter + Redis pub/sub.
 * Replaces scattered realtime.ts and eventBus.ts.
 */
export type AppEvent = "message:new" | "achievement:unlock" | "xp:update" | "challenge:new" | "challenge:update" | "quest:completed" | "crafting:complete" | "market:sold" | "feed:new" | "group:created" | "archetype:evolved" | "event:created";
interface EventMetadata {
    retries?: number;
    critical?: boolean;
    timestamp?: number;
}
/**
 * Publish event with retry logic
 */
export declare function publish(event: AppEvent | string, payload: any, options?: {
    critical?: boolean;
    retries?: number;
}): Promise<void>;
/**
 * Subscribe to events
 */
export declare function subscribe(event: AppEvent | string, handler: (payload: any, metadata?: EventMetadata) => void): () => void;
/**
 * Get event stats (for monitoring)
 */
export declare function getEventStats(): {
    stats: Record<string, {
        count: number;
        failures: number;
        avgTime: number;
    }>;
    failedEvents: {
        event: string;
        error: string;
        timestamp: Date;
    }[];
    redisConnected: boolean;
};
/**
 * Clear event stats
 */
export declare function clearEventStats(): void;
export {};
