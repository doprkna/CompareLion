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
/**
 * Publish an event to both local and Redis
 *
 * @param event Event name
 * @param payload Event data
 */
export declare function publishEvent(event: string, payload: any): Promise<void>;
/**
 * Check if Redis is available
 */
export declare function isRedisConnected(): boolean;
/**
 * Graceful shutdown
 */
export declare function disconnectRedis(): Promise<void>;
