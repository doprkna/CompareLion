/**
 * Enemy Registry Helpers
 * Common utilities for enemy type registry and lookup
 * v0.36.36 - Enemy Bestiary 1.0
 */
import { EnemyTier, EnemyRegion, StatPreset } from './types';
/**
 * Get all enemies by tier
 */
export declare function getEnemiesByTier(tier: EnemyTier): Promise<any>;
/**
 * Get all enemies by region
 * Note: This will work once region field is added to Enemy model
 */
export declare function getEnemiesByRegion(region: EnemyRegion): Promise<never[]>;
/**
 * Get random enemy by tier and region
 * Returns a random enemy matching the criteria
 */
export declare function getRandomEnemyByTierAndRegion(tier: EnemyTier, region: EnemyRegion): Promise<any>;
/**
 * Validate and normalize enemy tier
 */
export declare function normalizeEnemyTier(value: string | null | undefined): EnemyTier;
/**
 * Validate and normalize enemy region
 */
export declare function normalizeEnemyRegion(value: string | null | undefined): EnemyRegion;
/**
 * Validate and normalize stat preset
 */
export declare function normalizeStatPreset(value: string | null | undefined): StatPreset;
/**
 * Get enemy count by tier
 */
export declare function getEnemyCountByTier(): Promise<Record<EnemyTier, number>>;
