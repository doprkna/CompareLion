/**
 * Chest Service
 * Handle chest opening, daily login chests, chest rewards
 * v0.36.30 - Loot System 2.0
 */
export interface ChestReward {
    itemId: string;
    itemName: string;
    rarity: string;
    quantity: number;
}
export interface ChestOpenResult {
    success: boolean;
    items: ChestReward[];
    gold?: number;
    xp?: number;
}
/**
 * Get chest by type
 */
export declare function getChestByType(chestType: string): Promise<any>;
/**
 * Open a chest
 * Returns items, gold, XP based on chest quality
 */
export declare function openChest(userId: string, userChestId: string): Promise<ChestOpenResult>;
/**
 * Grant daily login chest
 * Creates a wooden chest for the user
 */
export declare function grantDailyLoginChest(userId: string): Promise<string | null>;
/**
 * Get user's unopened chests
 */
export declare function getUserChests(userId: string): Promise<any>;
