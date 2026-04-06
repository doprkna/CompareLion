/**
 * Loot Service 2.0
 * Full RPG-grade loot system with rarity tiers, weighted rolls, smart-drop protection
 * v0.36.30 - Loot System 2.0
 */
export interface LootTableData {
    items: Record<string, string[]>;
    weights: Record<string, number>;
}
export interface LootDropResult {
    itemId: string;
    itemName: string;
    rarity: string;
    item?: {
        id: string;
        name: string;
        emoji: string;
        icon: string;
        rarity: string;
    };
}
/**
 * Get loot table by enemy type or name
 */
export declare function getLootTable(enemyType?: string, tableName?: string): Promise<{
    id: any;
    name: any;
    enemyType: any;
    items: LootTableData["items"];
    weights: Record<string, number>;
} | null>;
/**
 * Roll loot drop from loot table
 * Returns item with rarity
 */
export declare function rollLootDrop(userId: string, enemyType?: string, tableName?: string): Promise<LootDropResult | null>;
/**
 * Grant loot drop to user
 * Adds item to inventory, sends notification
 */
export declare function grantLootDrop(userId: string, lootDrop: LootDropResult): Promise<{
    success: boolean;
    inventoryItemId?: string;
}>;
/**
 * Process fight drop
 * Main entry point for fight completion loot
 */
export declare function processFightDrop(userId: string, fightId: string, enemyType?: string): Promise<LootDropResult | null>;
