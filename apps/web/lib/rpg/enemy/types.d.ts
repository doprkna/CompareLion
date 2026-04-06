/**
 * Enemy Bestiary Types & Presets
 * Shared types, enums, and stat preset templates for Enemy Bestiary system
 * v0.36.36 - Enemy Bestiary 1.0
 */
/**
 * Enemy Tier - Determines difficulty and stat scaling
 */
export declare enum EnemyTier {
    COMMON = "common",
    ELITE = "elite",
    BOSS = "boss"
}
/**
 * Enemy Region - Geographic/biome variants
 */
export declare enum EnemyRegion {
    TUNDRA = "tundra",
    DESERT = "desert",
    FOREST = "forest",
    MOUNTAIN = "mountain",
    COASTAL = "coastal",
    SWAMP = "swamp",
    PLAINS = "plains",
    VOLCANIC = "volcanic",
    UNDERGROUND = "underground",
    URBAN = "urban"
}
/**
 * Stat Preset - Base stat distribution archetypes
 */
export declare enum StatPreset {
    BALANCED = "balanced",
    GLASS_CANNON = "glass_cannon",
    TANK = "tank"
}
/**
 * Base enemy stats structure (normalized base values)
 */
export interface EnemyBaseStats {
    hp: number;
    atk: number;
    def: number;
    speed: number;
    abilities?: string[];
}
/**
 * Calculated enemy stats (after tier + region multipliers)
 */
export interface EnemyCalculatedStats extends EnemyBaseStats {
    tier: EnemyTier;
    region: EnemyRegion;
    preset: StatPreset;
}
/**
 * Enemy Bestiary entry (full enemy definition)
 */
export interface EnemyBestiaryEntry {
    id: string;
    name: string;
    tier: EnemyTier;
    region: EnemyRegion;
    preset: StatPreset;
    baseStats: EnemyBaseStats;
    level: number;
    dropTableId?: string | null;
    icon?: string | null;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * Region multiplier configuration
 */
export interface RegionMultipliers {
    hpMult: number;
    atkMult: number;
    defMult: number;
    speedMult: number;
}
/**
 * Stat preset template
 */
export interface StatPresetTemplate {
    name: StatPreset;
    displayName: string;
    description: string;
    baseStats: EnemyBaseStats;
}
/**
 * Stat preset templates - Base stat distributions
 * These define the "archetype" stat spread before tier/region modifiers
 */
export declare const STAT_PRESETS: Record<StatPreset, StatPresetTemplate>;
/**
 * Region multipliers - Applied to base stats based on biome
 * Example: Tundra enemies have +10% HP (survival adaptation)
 */
export declare const REGION_MULTIPLIERS: Record<EnemyRegion, RegionMultipliers>;
/**
 * Tier multipliers - Applied after region multipliers
 * Determines final difficulty scaling
 */
export declare const TIER_MULTIPLIERS: Record<EnemyTier, number>;
/**
 * Get stat preset by name
 */
export declare function getStatPreset(preset: StatPreset | string): StatPresetTemplate;
/**
 * Get region multipliers
 */
export declare function getRegionMultipliers(region: EnemyRegion | string): RegionMultipliers;
/**
 * Get tier multiplier
 */
export declare function getTierMultiplier(tier: EnemyTier | string): number;
/**
 * Validate enemy tier
 */
export declare function isValidEnemyTier(value: string): value is EnemyTier;
/**
 * Validate enemy region
 */
export declare function isValidEnemyRegion(value: string): value is EnemyRegion;
/**
 * Validate stat preset
 */
export declare function isValidStatPreset(value: string): value is StatPreset;
