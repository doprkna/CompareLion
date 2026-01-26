let redis = null;
if (typeof window === "undefined") {
  try { redis = require("@parel/redis")?.redis ?? null; } catch { redis = null; }
}

export async function cacheGet(key) {
    if (!redis)
        return null;
    try {
        const raw = await redis.get(key);
        return raw ? JSON.parse(raw) : null;
    }
    catch (err) {
        console.error('[Cache:get]', err);
        return null;
    }
}
export async function cacheSet(key, value, ttlSeconds = 3600) {
    if (!redis)
        return false;
    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return true;
    }
    catch (err) {
        console.error('[Cache:set]', err);
        return false;
    }
}
export async function cacheDelete(key) {
    if (!redis)
        return false;
    try {
        await redis.del(key);
        return true;
    }
    catch (err) {
        console.error('[Cache:delete]', err);
        return false;
    }
}
