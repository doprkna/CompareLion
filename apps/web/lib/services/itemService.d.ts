/**
 * Item Service
 * Handles item generation, effects application, and stat calculations
 * v0.26.5 - Items 2.0: Rarity, Power & Effects
 */
import { RarityKey } from '@parel/core/config';
export interface ItemEffectResult {
    damageMult?: number;
    lifeSteal?: number;
    critChance?: number;
    xpBonus?: number;
    goldBonus?: number;
    hpBonus?: number;
}
export type EffectTrigger = 'onAttack' | 'onKill' | 'onCrit' | 'onStart' | 'onRest';
/**
 * Generate a new item with random rarity, power, and effect
 */
export declare function generateItem(rarity?: RarityKey, itemKey?: string): Promise<{
    rarity: RarityKey;
    power: number;
    effectKey: string | null;
    itemKey: string;
}>;
/**
 * Apply item effects based on equipped items and trigger event
 */
export declare function applyItemEffects(userId: string, trigger: EffectTrigger, baseStats?: Record<string, number>): Promise<Record<string, number>>;
/**
 * Get total power bonus from equipped items (with rarity multipliers)
 */
export declare function getTotalItemPower(userId: string): Promise<number>;
/**
 * Create inventory item from generated item data
 */
export declare function createInventoryItem(userId: string, itemId: string, itemData: {
    rarity: RarityKey;
    power: number;
    effectKey: string | null;
    itemKey: string;
}): Promise<{
    id: string;
}>;
/**
 * Equip an item - moves from inventory to equipped slot
 * Unequips existing item of same type if any
 * v0.36.3 - Equipment/inventory sync
 */
export declare function equipItem(userId: string, inventoryItemId: string): Promise<{
    success: boolean;
    equippedItem: any;
    unequippedItem?: any;
    stats: any;
}>;
/**
 * Unequip an item - moves from equipped slot back to inventory
 * v0.36.3 - Equipment/inventory sync
 */
export declare function unequipItem(userId: string, inventoryItemId: string): Promise<{
    success: boolean;
    unequippedItem: any;
    stats: any;
}>;
/**
 * Equip a UserItem by itemId
 * Enforces slot rules: only 1 item per slot, unequips previous item in same slot
 * v0.36.34 - Standardized inventory system
 */
export declare function equipUserItem(userId: string, itemId: string): Promise<{
    success: boolean;
    equippedItem: any;
    unequippedItem?: any;
    stats: any;
}>;
/**
 * Unequip a UserItem by itemId
 * v0.36.34 - Standardized inventory system
 */
export declare function unequipUserItem(userId: string, itemId: string): Promise<{
    success: boolean;
    unequippedItem: any;
    stats: any;
}>;
/**
 * Add item to user inventory (internal use, for loot system)
 * v0.36.34 - Standardized inventory system
 */
export declare function addItemToInventory(userId: string, itemId: string, quantity?: number): Promise<{
    id: string;
    quantity: number;
}>;
