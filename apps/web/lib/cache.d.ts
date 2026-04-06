/**
 * Simple In-Memory Cache
 * Fallback for flow state when Redis not available
 * v0.13.2i
 */
declare class MemoryCache {
    private cache;
    private cleanupInterval;
    constructor();
    /**
     * Set a value with optional TTL (in seconds)
     */
    set<T>(key: string, value: T, ttl?: number): void;
    /**
     * Get a value from cache
     */
    get<T>(key: string): T | null;
    /**
     * Delete a value from cache
     */
    delete(key: string): boolean;
    /**
     * Clear all cache entries
     */
    clear(): void;
    /**
     * Get cache size
     */
    size(): number;
    /**
     * Start periodic cleanup of expired entries
     */
    private startCleanup;
    /**
     * Stop cleanup interval
     */
    stop(): void;
}
export declare const cache: MemoryCache;
/**
 * Flow-specific cache helpers
 */
export interface FlowState {
    flowId: string;
    lastQuestionId: string;
    startedAt: number;
    questionsAnswered: number;
}
export declare function setFlowState(userId: string, state: FlowState): void;
export declare function getFlowState(userId: string): FlowState | null;
export declare function clearFlowState(userId: string): void;
export {};
