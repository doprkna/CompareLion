/**
 * Performance Caching Layer (v0.11.1)
 * 
 * Redis-backed caching for API endpoints to improve response times.
 */

import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });
  
  redis.on("error", (err) => {
    console.warn("[Cache] Redis connection error:", err.message);
  });
  
  redis.on("ready", () => {
    console.log("[Cache] Redis connected");
  });
} catch (error) {
  console.warn("[Cache] Redis initialization failed, falling back to no-cache");
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

/**
 * Default TTL values for different endpoint types
 */
export const CACHE_TTL = {
  FEED: 30, // 30 seconds
  LEADERBOARD: 60, // 1 minute
  ACTIVITY: 30, // 30 seconds
  USER_PROFILE: 120, // 2 minutes
  STATIC_DATA: 300, // 5 minutes
  STATS: 60, // 1 minute
} as const;

/**
 * Get cached data
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const data = await redis.get(key);
    if (!data) return null;
    
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn(`[Cache] Get failed for key ${key}:`, error);
    return null;
  }
}

/**
 * Set cached data
 */
export async function setCached<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  if (!redis) return;
  
  const { ttl = CACHE_TTL.STATIC_DATA, tags = [] } = options;
  
  try {
    const serialized = JSON.stringify(value);
    
    // Set with TTL
    await redis.setex(key, ttl, serialized);
    
    // Store tags for invalidation
    if (tags.length > 0) {
      for (const tag of tags) {
        await redis.sadd(`tag:${tag}`, key);
        await redis.expire(`tag:${tag}`, ttl);
      }
    }
  } catch (error) {
    console.warn(`[Cache] Set failed for key ${key}:`, error);
  }
}

/**
 * Delete cached data
 */
export async function deleteCached(key: string): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`[Cache] Delete failed for key ${key}:`, error);
  }
}

/**
 * Invalidate all cache entries with a specific tag
 */
export async function invalidateByTag(tag: string): Promise<void> {
  if (!redis) return;
  
  try {
    const keys = await redis.smembers(`tag:${tag}`);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      await redis.del(`tag:${tag}`);
    }
  } catch (error) {
    console.warn(`[Cache] Invalidate tag ${tag} failed:`, error);
  }
}

/**
 * Wrapper for caching API responses
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try cache first
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Cache for next time
  await setCached(key, data, options);
  
  return data;
}

/**
 * Generate cache key from request parameters
 */
export function getCacheKey(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {}
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  
  return sortedParams ? `${endpoint}?${sortedParams}` : endpoint;
}

/**
 * Clear all cache
 */
export async function clearCache(): Promise<void> {
  if (!redis) return;
  
  try {
    await redis.flushdb();
    console.log("[Cache] All cache cleared");
  } catch (error) {
    console.warn("[Cache] Clear all failed:", error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  connected: boolean;
  keys: number;
  memory: string;
}> {
  if (!redis) {
    return { connected: false, keys: 0, memory: "0" };
  }
  
  try {
    const dbsize = await redis.dbsize();
    const info = await redis.info("memory");
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const memory = memoryMatch ? memoryMatch[1] : "unknown";
    
    return {
      connected: true,
      keys: dbsize,
      memory,
    };
  } catch (error) {
    return { connected: false, keys: 0, memory: "0" };
  }
}











