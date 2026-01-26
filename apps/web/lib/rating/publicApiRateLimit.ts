/**
 * Public API Rate Limiting
 * Simple rate limiting for public API endpoints
 * v0.38.15 - AURE Public API
 */

import { RateLimitConfig, RateLimitResult } from '@/lib/security/rateLimit';
import { LRUCache } from 'lru-cache';

const PUBLIC_API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

// Simple in-memory rate limit cache for public API
const rateLimitCache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000,
  ttl: 60 * 1000, // 1 minute TTL
});

/**
 * Check rate limit for public API
 * Uses API key as the rate limit key
 * Simple in-memory implementation
 * 
 * @param apiKey - API key
 * @param req - Request object (unused but kept for consistency)
 * @returns Rate limit result
 */
export async function checkPublicApiRateLimit(
  apiKey: string,
  req: Request
): Promise<RateLimitResult> {
  const key = `public_api:${apiKey}`;
  const now = Date.now();
  const resetTime = now + PUBLIC_API_RATE_LIMIT.windowMs;

  const entry = rateLimitCache.get(key);
  const currentCount = entry ? entry.count : 0;

  if (entry && entry.resetTime > now) {
    // Within current window
    const allowed = currentCount < PUBLIC_API_RATE_LIMIT.maxRequests;
    const remaining = Math.max(0, PUBLIC_API_RATE_LIMIT.maxRequests - currentCount - 1);

    // Update count
    rateLimitCache.set(key, { count: currentCount + 1, resetTime: entry.resetTime });

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000),
    };
  } else {
    // New window or expired
    const allowed = true;
    const remaining = PUBLIC_API_RATE_LIMIT.maxRequests - 1;

    rateLimitCache.set(key, { count: 1, resetTime });

    return {
      allowed,
      remaining,
      resetTime,
      retryAfter: undefined,
    };
  }
}

