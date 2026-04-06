/**
 * Inventory API
 * v0.35.16c - Admin sees all items, users see owned items
 * v0.41.4 - C3 Step 5: Unified API envelope
 */
export declare const runtime = "nodejs";
/**
 * GET /api/inventory
 * Get user's item inventory (admin sees ALL items for verification)
 * ?view=ui — returns { equipped, backpack, totalCount } for Inventory modal (temporary adapter).
 */
export declare const GET: any;
