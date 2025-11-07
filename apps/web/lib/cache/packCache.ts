type CacheEntry<T> = { value: T; expiresAt: number };

const CACHE_MS = 60_000; // 1 minute TTL
const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number = CACHE_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidate(keyPrefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key);
  }
}


