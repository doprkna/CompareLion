/**
 * Inventory Equip API
 * Equip or unequip an inventory item
 * v0.26.5 - Items 2.0: Rarity, Power & Effects
 */
/**
 * POST /api/inventory/equip
 * Equip an item by itemId
 * Enforces slot rules: only 1 item per slot, unequips previous item in same slot
 * Body: { itemId: string }
 * v0.36.34 - Standardized inventory system
 */
export declare const POST: any;
