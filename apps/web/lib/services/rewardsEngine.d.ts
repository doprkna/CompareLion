/**
 * Rewards Engine
 * Handles loot table rolls and reward distribution
 * v0.36.7 - Rewards engine + loot tables
 */
export interface RewardResult {
    xp: number;
    gold: number;
    itemId?: string;
}
/**
 * Roll rewards from loot table for an enemy
 * Uses weighted random selection from loot table entries
 */
export declare function rollRewards(enemyId: string): Promise<RewardResult>;
/**
 * Grant reward item to user
 * Creates inventory item from itemId or generates new item
 */
export declare function grantRewardItem(userId: string, itemId?: string): Promise<{
    id: string;
} | null>;
