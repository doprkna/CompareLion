/**
 * Marketplace Listings API
 * GET /api/market/listings - List marketplace listings with filters and sorting
 * POST /api/market/listings - Create a new listing
 * v0.36.39 - Marketplace 2.0
 */
export declare const runtime = "nodejs";
/**
 * GET /api/market/listings
 * Get marketplace listings with filters and sorting
 * Query params: category, rarity, minPrice, maxPrice, sellerId, currency, sortBy, limit, cursor
 */
export declare const GET: any;
/**
 * POST /api/market/listings
 * Create a new marketplace listing
 */
export declare const POST: any;
