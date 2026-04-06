/**
 * Random Enemy API
 * GET /api/enemies/random?region=X&tier=Y
 * Returns a random enemy matching the specified region and tier
 * v0.36.36 - Enemy Bestiary 1.0
 */
export declare const runtime = "nodejs";
/**
 * GET /api/enemies/random
 * Query params:
 *   - region?: EnemyRegion (defaults to random)
 *   - tier?: EnemyTier (defaults to random/common)
 */
export declare const GET: any;
