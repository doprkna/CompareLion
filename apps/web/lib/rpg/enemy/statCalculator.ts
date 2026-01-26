/**
 * Enemy Stat Calculator
 * Calculates final enemy stats from base stats, tier, and region multipliers
 * v0.36.36 - Enemy Bestiary 1.0
 */

import {
  EnemyBaseStats,
  EnemyCalculatedStats,
  EnemyTier,
  EnemyRegion,
  StatPreset,
  getStatPreset,
  getRegionMultipliers,
  getTierMultiplier,
} from './types';

/**
 * Calculate final enemy stats
 * Formula: (baseStats * regionMultipliers) * tierMultiplier
 * 
 * @param baseStats - Base stats from preset or custom
 * @param tier - Enemy tier (common, elite, boss)
 * @param region - Enemy region (tundra, desert, etc.)
 * @param preset - Stat preset used (for reference)
 * @returns Calculated stats with all multipliers applied
 */
export function calculateEnemyStats(
  baseStats: EnemyBaseStats,
  tier: EnemyTier,
  region: EnemyRegion,
  preset: StatPreset = StatPreset.BALANCED
): EnemyCalculatedStats {
  const regionMult = getRegionMultipliers(region);
  const tierMult = getTierMultiplier(tier);

  // Step 1: Apply region multipliers to base stats
  const regionAdjusted: EnemyBaseStats = {
    hp: Math.round(baseStats.hp * regionMult.hpMult),
    atk: Math.round(baseStats.atk * regionMult.atkMult),
    def: Math.round(baseStats.def * regionMult.defMult),
    speed: Math.round(baseStats.speed * regionMult.speedMult),
    abilities: baseStats.abilities || [],
  };

  // Step 2: Apply tier multiplier to all stats
  const finalStats: EnemyCalculatedStats = {
    hp: Math.round(regionAdjusted.hp * tierMult),
    atk: Math.round(regionAdjusted.atk * tierMult),
    def: Math.round(regionAdjusted.def * tierMult),
    speed: Math.round(regionAdjusted.speed * tierMult),
    abilities: regionAdjusted.abilities,
    tier,
    region,
    preset,
  };

  // Ensure minimum values (stats can't be 0 or negative)
  finalStats.hp = Math.max(1, finalStats.hp);
  finalStats.atk = Math.max(1, finalStats.atk);
  finalStats.def = Math.max(0, finalStats.def);
  finalStats.speed = Math.max(1, finalStats.speed);

  return finalStats;
}

/**
 * Calculate stats from preset name
 * Convenience function that looks up preset and calculates
 */
export function calculateEnemyStatsFromPreset(
  preset: StatPreset | string,
  tier: EnemyTier,
  region: EnemyRegion
): EnemyCalculatedStats {
  const presetTemplate = getStatPreset(preset);
  return calculateEnemyStats(
    presetTemplate.baseStats,
    tier,
    region,
    presetTemplate.name
  );
}

/**
 * Preview stat calculation
 * Returns breakdown of calculation steps for UI display
 */
export function previewStatCalculation(
  baseStats: EnemyBaseStats,
  tier: EnemyTier,
  region: EnemyRegion
): {
  base: EnemyBaseStats;
  afterRegion: EnemyBaseStats;
  final: EnemyCalculatedStats;
  multipliers: {
    region: ReturnType<typeof getRegionMultipliers>;
    tier: number;
  };
} {
  const regionMult = getRegionMultipliers(region);
  const tierMult = getTierMultiplier(tier);

  const afterRegion: EnemyBaseStats = {
    hp: Math.round(baseStats.hp * regionMult.hpMult),
    atk: Math.round(baseStats.atk * regionMult.atkMult),
    def: Math.round(baseStats.def * regionMult.defMult),
    speed: Math.round(baseStats.speed * regionMult.speedMult),
    abilities: baseStats.abilities || [],
  };

  const final = calculateEnemyStats(baseStats, tier, region);

  return {
    base: { ...baseStats },
    afterRegion,
    final,
    multipliers: {
      region: regionMult,
      tier: tierMult,
    },
  };
}

