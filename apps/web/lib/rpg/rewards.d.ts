/**
 * Reward Engine v2
 * Rarity-based loot drops with tier multipliers
 * v0.36.13 - Loot Rarity System
 */
import { EnemyTier } from './rarity';
import { ComputedStats } from './stats';
import { GeneratedEnemy } from './enemyGenerator';
export interface RewardResult {
    xp: number;
    gold: number;
    items: Array<{
        itemId: string;
        quantity: number;
    }>;
    item?: {
        id: string;
        name: string;
        rarity: string;
        itemKey?: string | null;
    } | null;
}
export interface LootTableRow {
    id: string;
    enemyId: string;
    itemId: string | null;
    weight: number;
    minGold: number;
    maxGold: number;
    minXp: number;
    maxXp: number;
}
/**
 * Roll rewards for a fight
 * Handles XP/gold and rarity-based item drops
 */
export declare function rollRewardsForFight(params: {
    hero: ComputedStats;
    enemy: GeneratedEnemy | {
        id: string;
        xpReward?: number;
        goldReward?: number;
        level?: number;
    };
    enemyTier: EnemyTier;
    lootTableRows: LootTableRow[];
}): Promise<RewardResult>;
/**
 * Grant reward item to user's inventory
 * Uses standardized UserItem system (v0.36.34)
 */
export declare function grantRewardItem(userId: string, itemId: string): Promise<{
    id: string;
    type?: 'item' | 'pet';
} | null>;
