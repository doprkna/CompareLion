/**
 * Performance Caching Layer - Redis when enabled, no-op otherwise.
 */
import { getRedisClient, hasRedis } from '@parel/redis';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export const CACHE_TTL = {
  FEED: 30,
  LEADERBOARD: 60,
  ACTIVITY: 30,
  USER_PROFILE: 120,
  STATIC_DATA: 300,
  STATS: 60,
} as const;

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  const { ttl = CACHE_TTL.STATIC_DATA, tags = [] } = options;
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    if (tags.length > 0) {
      for (const tag of tags) {
        await redis.sadd(`tag:${tag}`, key);
        await redis.expire(`tag:${tag}`, ttl);
      }
    }
  } catch {}
}

export async function deleteCached(key: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try { await redis.del(key); } catch {}
}

export async function invalidateByTag(tag: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    const keys = await redis.smembers(`tag:${tag}`);
    if (keys.length > 0) {
      await redis.del(...keys);
      await redis.del(`tag:${tag}`);
    }
  } catch {}
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  await setCached(key, data, options);
  return data;
}

export function getCacheKey(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {}
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return sortedParams ? `${endpoint}?${sortedParams}` : endpoint;
}

export async function clearCache(): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  try { await redis.flushdb(); } catch {}
}

export async function getCacheStats(): Promise<{ connected: boolean; keys: number; memory: string }> {
  const redis = getRedisClient();
  if (!redis) return { connected: false, keys: 0, memory: '0' };
  try {
    const dbsize = await redis.dbsize();
    const info = await redis.info('memory');
    const m = info.match(/used_memory_human:([^\r\n]+)/);
    return { connected: true, keys: dbsize, memory: m ? m[1] : 'unknown' };
  } catch {
    return { connected: false, keys: 0, memory: '0' };
  }
}
