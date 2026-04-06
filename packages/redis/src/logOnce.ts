let _redisErrorLogged = false;

/** Log Redis connection error at most once per process. Reduces dev spam. */
export function logRedisErrorOnce(err: Error): void {
  if (_redisErrorLogged) return;
  _redisErrorLogged = true;
  const msg = process.env.NODE_ENV === 'production'
    ? `[Redis] Connection failed: ${err.message}`
    : 'Redis disabled or unavailable (set REDIS_URL to enable).';
  console.warn(`[Redis] ${msg}`);
}
