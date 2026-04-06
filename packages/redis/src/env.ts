/**
 * Single source of truth for Redis env.
 * In dev, REDIS_URL unset => Redis disabled by default.
 */
export const REDIS_URL = process.env.REDIS_URL?.trim() ?? '';
export const REDIS_DISABLED = process.env.REDIS_DISABLED === 'true' || process.env.REDIS_DISABLED === '1';
export const hasRedis = !!REDIS_URL && !REDIS_DISABLED;
