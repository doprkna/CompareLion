/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Metrics API
 * Aggregated analytics data
 * v0.13.2n - Community Growth (extended with growth tracking)
 */
/**
 * GET /api/admin/metrics
 * Get aggregated metrics (admin only)
 */
export declare const GET: any;
/**
 * POST /api/admin/metrics
 * Store metrics events (called from /api/metrics)
 * Note: This is an internal API, not directly called by clients
 */
export declare const POST: any;
