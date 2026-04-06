/**
 * Material Drop Resolver
 * Resolves material drops from combat encounters
 * v0.36.40 - Materials & Crafting 1.0
 */
import { MaterialDrop } from './types';
/**
 * Resolve material drops for an enemy
 *
 * @param enemyId - The enemy ID that was defeated
 * @param modifiers - Optional modifiers (e.g., luck bonus, drop rate multiplier)
 * @returns Array of material drops
 */
export declare function resolveMaterialDrops(enemyId: string, modifiers?: {
    dropRateMultiplier?: number;
    luckBonus?: number;
}): Promise<MaterialDrop[]>;
/**
 * Grant material drops to user
 * Adds materials to user's inventory
 *
 * @param userId - User ID
 * @param drops - Array of material drops
 */
export declare function grantMaterialDrops(userId: string, drops: MaterialDrop[]): Promise<void>;
/**
 * Resolve and grant material drops in one call
 * Convenience function for combat completion
 *
 * @param userId - User ID
 * @param enemyId - Enemy ID that was defeated
 * @param modifiers - Optional modifiers
 */
export declare function resolveAndGrantMaterialDrops(userId: string, enemyId: string, modifiers?: {
    dropRateMultiplier?: number;
    luckBonus?: number;
}): Promise<MaterialDrop[]>;
