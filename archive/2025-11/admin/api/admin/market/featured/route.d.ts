/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Featured Items API
 * v0.34.3 - Rotate featured marketplace items
 */
/**
 * GET /api/admin/market/featured
 * Returns current featured items
 */
export declare const GET: any;
/**
 * POST /api/admin/market/featured
 * Rotate featured items (manual or auto)
 * Body: { itemIds?: string[], auto?: boolean }
 */
export declare const POST: any;
