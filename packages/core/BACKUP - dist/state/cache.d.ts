/**
 * Client-Side Cache Management
 * Cache utilities for state management
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */
import type { CacheConfig } from './types';
/**
 * Cache Manager
 * In-memory cache for client-side state management
 */
export declare class CacheManager {
    private cache;
    private config;
    private size;
    constructor(config?: CacheConfig);
    /**
     * Set cache entry
     */
    set<T>(key: string, data: T, ttl?: number, tags?: string[]): void;
    /**
     * Get cache entry
     */
    get<T>(key: string): T | null;
    /**
     * Check if key exists and is valid
     */
    has(key: string): boolean;
    /**
     * Invalidate cache entry(ies)
     */
    invalidate(key: string | string[]): void;
    /**
     * Invalidate by tag
     */
    invalidateByTag(tag: string): void;
    /**
     * Invalidate by pattern (simple string matching)
     */
    invalidateByPattern(pattern: string): void;
    /**
     * Clear all cache
     */
    clear(): void;
    /**
     * Get cache size
     */
    getSize(): number;
    /**
     * Evict oldest entry (FIFO)
     */
    private evictOldest;
}
/**
 * Default cache manager instance
 */
export declare const defaultCache: CacheManager;
/**
 * Invalidate cache by pattern
 * Convenience function using default cache
 */
export declare function invalidateByPattern(pattern: string): void;
/**
 * Invalidate cache by tags
 * Convenience function using default cache
 */
export declare function invalidateByTags(tags: string[]): void;
/**
 * Create cache key from parts
 */
export declare function createCacheKey(...parts: (string | number | null | undefined)[]): string;
