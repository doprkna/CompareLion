/**
 * Enemy Registry Helpers
 * Common utilities for enemy type registry and lookup
 * v0.36.36 - Enemy Bestiary 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  EnemyTier,
  EnemyRegion,
  StatPreset,
  isValidEnemyTier,
  isValidEnemyRegion,
  isValidStatPreset,
} from './types';

/**
 * Get all enemies by tier
 */
export async function getEnemiesByTier(tier: EnemyTier) {
  try {
    const enemies = await prisma.enemy.findMany({
      where: {
        rarity: tier, // Note: rarity field maps to tier in current schema
      },
      orderBy: {
        level: 'asc',
      },
    });
    return enemies;
  } catch (error) {
    logger.error('[EnemyRegistry] Failed to get enemies by tier', { tier, error });
    throw error;
  }
}

/**
 * Get all enemies by region
 * Note: This will work once region field is added to Enemy model
 */
export async function getEnemiesByRegion(region: EnemyRegion) {
  try {
    // TODO: Update once region field exists in schema
    // const enemies = await prisma.enemy.findMany({
    //   where: { region },
    //   orderBy: { level: 'asc' },
    // });
    
    // For now, return empty array until schema is updated
    logger.warn('[EnemyRegistry] getEnemiesByRegion called but region field not yet in schema');
    return [];
  } catch (error) {
    logger.error('[EnemyRegistry] Failed to get enemies by region', { region, error });
    throw error;
  }
}

/**
 * Get random enemy by tier and region
 * Returns a random enemy matching the criteria
 */
export async function getRandomEnemyByTierAndRegion(
  tier: EnemyTier,
  region: EnemyRegion
) {
  try {
    // TODO: Update once region field exists in schema
    // const enemies = await prisma.enemy.findMany({
    //   where: {
    //     rarity: tier,
    //     region,
    //   },
    // });
    
    // For now, fallback to tier-only lookup
    const enemies = await getEnemiesByTier(tier);
    
    if (enemies.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * enemies.length);
    return enemies[randomIndex];
  } catch (error) {
    logger.error('[EnemyRegistry] Failed to get random enemy', { tier, region, error });
    throw error;
  }
}

/**
 * Validate and normalize enemy tier
 */
export function normalizeEnemyTier(value: string | null | undefined): EnemyTier {
  if (!value) {
    return EnemyTier.COMMON;
  }
  
  if (isValidEnemyTier(value)) {
    return value;
  }
  
  // Fallback: try to map common variations
  const normalized = value.toLowerCase();
  if (normalized === 'elite' || normalized === 'rare') {
    return EnemyTier.ELITE;
  }
  if (normalized === 'boss' || normalized === 'legendary') {
    return EnemyTier.BOSS;
  }
  
  return EnemyTier.COMMON;
}

/**
 * Validate and normalize enemy region
 */
export function normalizeEnemyRegion(value: string | null | undefined): EnemyRegion {
  if (!value) {
    return EnemyRegion.PLAINS; // Default region
  }
  
  if (isValidEnemyRegion(value)) {
    return value;
  }
  
  // Fallback: try to map common variations
  const normalized = value.toLowerCase();
  const regionMap: Record<string, EnemyRegion> = {
    tundra: EnemyRegion.TUNDRA,
    desert: EnemyRegion.DESERT,
    forest: EnemyRegion.FOREST,
    mountain: EnemyRegion.MOUNTAIN,
    coastal: EnemyRegion.COASTAL,
    swamp: EnemyRegion.SWAMP,
    plains: EnemyRegion.PLAINS,
    volcanic: EnemyRegion.VOLCANIC,
    underground: EnemyRegion.UNDERGROUND,
    urban: EnemyRegion.URBAN,
  };
  
  return regionMap[normalized] || EnemyRegion.PLAINS;
}

/**
 * Validate and normalize stat preset
 */
export function normalizeStatPreset(value: string | null | undefined): StatPreset {
  if (!value) {
    return StatPreset.BALANCED;
  }
  
  if (isValidStatPreset(value)) {
    return value;
  }
  
  // Fallback: try to map common variations
  const normalized = value.toLowerCase().replace(/[_-]/g, '_');
  if (normalized === 'glasscannon' || normalized === 'glass_cannon') {
    return StatPreset.GLASS_CANNON;
  }
  if (normalized === 'tank') {
    return StatPreset.TANK;
  }
  
  return StatPreset.BALANCED;
}

/**
 * Get enemy count by tier
 */
export async function getEnemyCountByTier(): Promise<Record<EnemyTier, number>> {
  try {
    const counts = {
      [EnemyTier.COMMON]: 0,
      [EnemyTier.ELITE]: 0,
      [EnemyTier.BOSS]: 0,
    };
    
    const enemies = await prisma.enemy.findMany({
      select: { rarity: true },
    });
    
    enemies.forEach((enemy) => {
      const tier = normalizeEnemyTier(enemy.rarity);
      counts[tier] = (counts[tier] || 0) + 1;
    });
    
    return counts;
  } catch (error) {
    logger.error('[EnemyRegistry] Failed to get enemy counts', { error });
    return {
      [EnemyTier.COMMON]: 0,
      [EnemyTier.ELITE]: 0,
      [EnemyTier.BOSS]: 0,
    };
  }
}

