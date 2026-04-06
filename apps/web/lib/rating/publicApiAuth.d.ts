/**
 * Public API Authentication
 * API key validation for external AURE access
 * v0.38.15 - AURE Public API
 */
/**
 * Validate API key
 * Checks against PUBLIC_API_KEY environment variable
 *
 * @param apiKey - API key from request
 * @returns True if valid, false otherwise
 */
export declare function validateApiKey(apiKey: string | null | undefined): boolean;
/**
 * Get API key from request headers or body
 */
export declare function extractApiKey(req: Request, body?: any): string | null;
