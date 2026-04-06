/**
 * Enemy Stat Calculator
 * Calculates final enemy stats from base stats, tier, and region multipliers
 * v0.36.36 - Enemy Bestiary 1.0
 */
import { EnemyBaseStats, EnemyCalculatedStats, EnemyTier, EnemyRegion, StatPreset, getRegionMultipliers } from './types';
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
export declare function calculateEnemyStats(baseStats: EnemyBaseStats, tier: EnemyTier, region: EnemyRegion, preset?: StatPreset): EnemyCalculatedStats;
/**
 * Calculate stats from preset name
 * Convenience function that looks up preset and calculates
 */
export declare function calculateEnemyStatsFromPreset(preset: StatPreset | string, tier: EnemyTier, region: EnemyRegion): EnemyCalculatedStats;
/**
 * Preview stat calculation
 * Returns breakdown of calculation steps for UI display
 */
export declare function previewStatCalculation(baseStats: EnemyBaseStats, tier: EnemyTier, region: EnemyRegion): {
    base: EnemyBaseStats;
    afterRegion: EnemyBaseStats;
    final: EnemyCalculatedStats;
    multipliers: {
        region: ReturnType<typeof getRegionMultipliers>;
        tier: number;
    };
};
