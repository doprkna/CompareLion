/**
 * Performance Caching Layer (v0.11.1)
 *
 * Redis-backed caching for API endpoints to improve response times.
 */
export interface CacheOptions {
    ttl?: number;
    tags?: string[];
}
/**
 * Default TTL values for different endpoint types
 */
export declare const CACHE_TTL: {
    readonly FEED: 30;
    readonly LEADERBOARD: 60;
    readonly ACTIVITY: 30;
    readonly USER_PROFILE: 120;
    readonly STATIC_DATA: 300;
    readonly STATS: 60;
};
/**
 * Get cached data
 */
export declare function getCached<T>(key: string): Promise<T | null>;
/**
 * Set cached data
 */
export declare function setCached<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
/**
 * Delete cached data
 */
export declare function deleteCached(key: string): Promise<void>;
/**
 * Invalidate all cache entries with a specific tag
 */
export declare function invalidateByTag(tag: string): Promise<void>;
/**
 * Wrapper for caching API responses
 */
export declare function withCache<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T>;
/**
 * Generate cache key from request parameters
 */
export declare function getCacheKey(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string;
/**
 * Clear all cache
 */
export declare function clearCache(): Promise<void>;
/**
 * Get cache statistics
 */
export declare function getCacheStats(): Promise<{
    connected: boolean;
    keys: number;
    memory: string;
}>;
