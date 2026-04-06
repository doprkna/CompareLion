/**
 * Public API Rate Limiting
 * Simple rate limiting for public API endpoints
 * v0.38.15 - AURE Public API
 */
import { RateLimitResult } from '@/lib/security/rateLimit';
/**
 * Check rate limit for public API
 * Uses API key as the rate limit key
 * Simple in-memory implementation
 *
 * @param apiKey - API key
 * @param req - Request object (unused but kept for consistency)
 * @returns Rate limit result
 */
export declare function checkPublicApiRateLimit(apiKey: string, req: Request): Promise<RateLimitResult>;
