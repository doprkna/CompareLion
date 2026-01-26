/**
 * Public API Authentication
 * API key validation for external AURE access
 * v0.38.15 - AURE Public API
 */

import { logger } from '@/lib/logger';

/**
 * Validate API key
 * Checks against PUBLIC_API_KEY environment variable
 * 
 * @param apiKey - API key from request
 * @returns True if valid, false otherwise
 */
export function validateApiKey(apiKey: string | null | undefined): boolean {
  if (!apiKey) {
    return false;
  }

  const validKey = process.env.PUBLIC_API_KEY;
  
  if (!validKey) {
    logger.warn('[PublicAPI] PUBLIC_API_KEY not configured');
    return false;
  }

  return apiKey === validKey;
}

/**
 * Get API key from request headers or body
 */
export function extractApiKey(req: Request, body?: any): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = req.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Check body (for POST requests)
  if (body && body.apiKey) {
    return body.apiKey;
  }

  return null;
}

