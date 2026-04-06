/**
 * Presence/heartbeat layer
 * Uses @parel/redis; falls back gracefully when Redis unavailable
 */
import { getRedisClient, hasRedis } from '@parel/redis';

const PRESENCE_KEY = 'presence:online';
const ONLINE_WINDOW_SECONDS = 120;

function getRedis() {
  if (!hasRedis) return null;
  return getRedisClient();
}

/**
 * Record user as online (call from POST /api/presence/ping)
 */
export async function recordPresence(userId: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    const now = Math.floor(Date.now() / 1000);
    await redis.zadd(PRESENCE_KEY, now, userId);
    const cutoff = now - ONLINE_WINDOW_SECONDS * 2;
    await redis.zremrangebyscore(PRESENCE_KEY, '-inf', cutoff);
    return true;
  } catch {
    return false;
  }
}

/**
 * Count users online in last ONLINE_WINDOW_SECONDS
 */
export async function getOnlineCount(): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const now = Math.floor(Date.now() / 1000);
    const min = now - ONLINE_WINDOW_SECONDS;
    const count = await redis.zcount(PRESENCE_KEY, min, '+inf');
    return count;
  } catch {
    return null;
  }
}

export { ONLINE_WINDOW_SECONDS };
