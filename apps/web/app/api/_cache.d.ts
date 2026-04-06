/**
 * Server-side caching utility
 * In-memory cache with TTL support
 * v0.32.1 - Performance & Caching Audit
 */
/**
 * Get cached value or compute and cache it
 *
 * @param key - Cache key
 * @param ttl - Time to live in milliseconds
 * @param fn - Function to compute value if not cached
 * @returns Cached or computed value
 */
export declare function cached<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T>;
/**
 * Clear specific cache entry
 */
export declare function clearCache(key: string): void;
/**
 * Clear all cache entries
 */
export declare function clearAllCache(): void;
/**
 * Get cache size
 */
export declare function getCacheSize(): number;
/**
 * Get cache stats
 */
export declare function getCacheStats(): {
    size: number;
    entries: Array<{
        key: string;
        expires: number;
    }>;
};
