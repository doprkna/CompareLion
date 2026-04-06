/**
 * Inventory Add API (Internal)
 * Add items to user inventory (used by loot system)
 * v0.36.34 - Standardized inventory system
 */
export declare const runtime = "nodejs";
/**
 * POST /api/inventory/add
 * Add item(s) to user inventory (internal use, admin or system only)
 * Body: { userId?: string, itemId: string, quantity?: number }
 * If userId not provided, uses authenticated user
 */
export declare const POST: any;
