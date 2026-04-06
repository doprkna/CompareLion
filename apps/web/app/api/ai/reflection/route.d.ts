/**
 * AI Reflection API
 * v0.19.0 - Generate personalized reflections
 * v0.22.5 - Add caching to prevent duplicate generation
 */
/**
 * POST /api/ai/reflection
 * Generate a new reflection for the user (with deduplication cache)
 */
export declare const POST: any;
/**
 * GET /api/ai/reflection
 * Get user's reflection history (cached for 30 minutes)
 */
export declare const GET: any;
