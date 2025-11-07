/**
 * Server-side caching utility
 * In-memory cache with TTL support
 * v0.32.1 - Performance & Caching Audit
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get cached value or compute and cache it
 * 
 * @param key - Cache key
 * @param ttl - Time to live in milliseconds
 * @param fn - Function to compute value if not cached
 * @returns Cached or computed value
 */
export async function cached<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);

  // Return cached value if still valid
  if (entry && entry.expires > now) {
    return entry.data as T;
  }

  // Compute new value
  const data = await fn();

  // Cache it
  cache.set(key, {
    data,
    expires: now + ttl,
  });

  // Clean up expired entries periodically
  if (cache.size > 1000) {
    cleanup();
  }

  return data;
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Clean up expired cache entries
 */
function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expires <= now) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache size
 */
export function getCacheSize(): number {
  return cache.size;
}

/**
 * Get cache stats
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ key: string; expires: number }>;
} {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      expires: entry.expires,
    })),
  };
}

