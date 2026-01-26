// sanity-fix: replaced @parel/redis import with local stub (missing dependency)
let redis: any = null;
if (typeof window === "undefined") {
  try { redis = require("@parel/redis")?.redis ?? null; } catch { redis = null; }
}

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('[Cache:get]', err);
    return null;
  }
}

export async function cacheSet(key: string, value: any, ttlSeconds = 3600) {
  if (!redis) return false;

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return true;
  } catch (err) {
    console.error('[Cache:set]', err);
    return false;
  }
}

export async function cacheDelete(key: string) {
  if (!redis) return false;

  try {
    await redis.del(key);
    return true;
  } catch (err) {
    console.error('[Cache:delete]', err);
    return false;
  }
}

