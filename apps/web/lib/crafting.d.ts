/**
 * Crafting System
 *
 * Item combination, rarity upgrades, and stat variance.
 */
export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";
/**
 * Get next rarity tier
 */
export declare function getNextRarity(current: RarityTier): RarityTier;
/**
 * Apply stat variance (±10%)
 */
export declare function applyStatVariance(baseStat: number): number;
/**
 * Calculate crafting success (5% failure rate by default)
 */
export declare function rollCraftingSuccess(successRate?: number): boolean;
/**
 * Check if user has required items
 */
export declare function hasRequiredItems(userId: string, itemIds: string[]): Promise<{
    hasAll: boolean;
    missing: string[];
}>;
/**
 * Consume items from inventory
 */
export declare function consumeItems(userId: string, itemIds: string[]): Promise<void>;
/**
 * Add crafted item to inventory
 */
export declare function addCraftedItem(userId: string, itemId: string, quantity?: number): Promise<void>;
/**
 * Perform crafting with all checks
 */
export declare function performCrafting(userId: string, recipeId: string): Promise<{
    success: boolean;
    outputItem?: any;
    message: string;
    goldSpent: number;
    rarityAchieved?: RarityTier;
}>;
/**
 * Get available recipes for user
 */
export declare function getAvailableRecipes(userId: string): Promise<any>;
/**
 * Get crafting history for user
 */
export declare function getCraftingHistory(userId: string, limit?: number): Promise<any>;
