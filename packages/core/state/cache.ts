/**
 * Client-Side Cache Management
 * Cache utilities for state management
 * v0.41.16 - C3 Step 17: Unified State Management Foundation
 */

import type { CacheEntry, CacheConfig } from './types';

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: Required<CacheConfig> = {
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  enabled: true,
};

/**
 * Cache Manager
 * In-memory cache for client-side state management
 */
export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private config: Required<CacheConfig>;
  private size: number = 0;

  constructor(config?: CacheConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number, tags?: string[]): void {
    if (!this.config.enabled) return;

    // Check if we need to evict entries
    if (this.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTtl,
      tags,
    };

    if (!this.cache.has(key)) {
      this.size++;
    }

    this.cache.set(key, entry);
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.size--;
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    if (!this.config.enabled) return false;
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.size--;
      return false;
    }

    return true;
  }

  /**
   * Invalidate cache entry(ies)
   */
  invalidate(key: string | string[]): void {
    const keys = Array.isArray(key) ? key : [key];
    keys.forEach((k) => {
      if (this.cache.has(k)) {
        this.cache.delete(k);
        this.size--;
      }
    });
  }

  /**
   * Invalidate by tag
   */
  invalidateByTag(tag: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (entry.tags?.includes(tag)) {
        keysToDelete.push(key);
      }
    });
    this.invalidate(keysToDelete);
  }

  /**
   * Invalidate by pattern (simple string matching)
   */
  invalidateByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    this.invalidate(keysToDelete);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.size = 0;
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Evict oldest entry (FIFO)
   */
  private evictOldest(): void {
    if (this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.size--;
    }
  }
}

/**
 * Default cache manager instance
 */
export const defaultCache = new CacheManager();

/**
 * Invalidate cache by pattern
 * Convenience function using default cache
 */
export function invalidateByPattern(pattern: string): void {
  defaultCache.invalidateByPattern(pattern);
}

/**
 * Invalidate cache by tags
 * Convenience function using default cache
 */
export function invalidateByTags(tags: string[]): void {
  tags.forEach((tag) => defaultCache.invalidateByTag(tag));
}

/**
 * Create cache key from parts
 */
export function createCacheKey(...parts: (string | number | null | undefined)[]): string {
  return parts.filter((p) => p != null).join(':');
}

