import Redis from 'ioredis';

export function createRedisClient() {
  // TODO-ENV: Consider injecting via config instead of reading process.env directly
  const url = process.env.REDIS_URL;

  if (!url) {
    console.warn('[Redis] REDIS_URL not set → running in no-cache mode');
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

  client.on('error', (err: Error) => {
    console.error('[Redis] Connection error:', err);
  });

  client.on('connect', () => {
    console.log('[Redis] Connected');
  });

  return client;
}

export const redis = createRedisClient();

