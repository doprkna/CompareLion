import Redis from 'ioredis';
import { logRedisErrorOnce } from './logOnce';
import { hasRedis, REDIS_URL } from './env';

let _client: Redis | null = null;

/**
 * Get Redis client. Returns null when Redis is disabled or URL is empty.
 * Attaches error handler to prevent unhandled error events.
 */
export function getRedisClient(): Redis | null {
  if (!hasRedis) return null;
  if (_client) return _client;

  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  client.on('error', (err: Error) => {
    logRedisErrorOnce(err);
  });

  _client = client;
  return client;
}

/** @deprecated Use getRedisClient() instead. Kept for backward compat. */
export const redis = getRedisClient();
