/**
 * Enemy Bestiary Types & Presets
 * Shared types, enums, and stat preset templates for Enemy Bestiary system
 * v0.36.36 - Enemy Bestiary 1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Enemy Tier - Determines difficulty and stat scaling
 */
export enum EnemyTier {
  COMMON = 'common',
  ELITE = 'elite',
  BOSS = 'boss',
}

/**
 * Enemy Region - Geographic/biome variants
 */
export enum EnemyRegion {
  TUNDRA = 'tundra',
  DESERT = 'desert',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  COASTAL = 'coastal',
  SWAMP = 'swamp',
  PLAINS = 'plains',
  VOLCANIC = 'volcanic',
  UNDERGROUND = 'underground',
  URBAN = 'urban',
}

/**
 * Stat Preset - Base stat distribution archetypes
 */
export enum StatPreset {
  BALANCED = 'balanced',
  GLASS_CANNON = 'glass_cannon',
  TANK = 'tank',
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Base enemy stats structure (normalized base values)
 */
export interface EnemyBaseStats {
  hp: number;
  atk: number;
  def: number;
  speed: number;
  abilities?: string[]; // Future: ability keys
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
  level: number; // Base level (can be scaled)
  dropTableId?: string | null; // Future: FK to DropTable
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

// ============================================================================
// STAT PRESET TEMPLATES
// ============================================================================

/**
 * Stat preset templates - Base stat distributions
 * These define the "archetype" stat spread before tier/region modifiers
 */
export const STAT_PRESETS: Record<StatPreset, StatPresetTemplate> = {
  [StatPreset.BALANCED]: {
    name: StatPreset.BALANCED,
    displayName: 'Balanced',
    description: 'Well-rounded stats with no major weaknesses',
    baseStats: {
      hp: 50,
      atk: 10,
      def: 8,
      speed: 7,
      abilities: [],
    },
  },
  [StatPreset.GLASS_CANNON]: {
    name: StatPreset.GLASS_CANNON,
    displayName: 'Glass Cannon',
    description: 'High attack, low defense and HP',
    baseStats: {
      hp: 30,
      atk: 18,
      def: 3,
      speed: 12,
      abilities: [],
    },
  },
  [StatPreset.TANK]: {
    name: StatPreset.TANK,
    displayName: 'Tank',
    description: 'High HP and defense, low attack and speed',
    baseStats: {
      hp: 100,
      atk: 6,
      def: 15,
      speed: 3,
      abilities: [],
    },
  },
};

// ============================================================================
// REGION MULTIPLIERS
// ============================================================================

/**
 * Region multipliers - Applied to base stats based on biome
 * Example: Tundra enemies have +10% HP (survival adaptation)
 */
export const REGION_MULTIPLIERS: Record<EnemyRegion, RegionMultipliers> = {
  [EnemyRegion.TUNDRA]: {
    hpMult: 1.1, // +10% HP (survival)
    atkMult: 0.95, // -5% ATK (slower metabolism)
    defMult: 1.05, // +5% DEF (thick hide)
    speedMult: 0.9, // -10% SPEED (cold slows movement)
  },
  [EnemyRegion.DESERT]: {
    hpMult: 0.9, // -10% HP (harsh environment)
    atkMult: 1.1, // +10% ATK (aggressive predators)
    defMult: 0.95, // -5% DEF (less armor)
    speedMult: 1.15, // +15% SPEED (adapted to sand)
  },
  [EnemyRegion.FOREST]: {
    hpMult: 1.0, // Neutral
    atkMult: 1.0, // Neutral
    defMult: 1.0, // Neutral
    speedMult: 1.1, // +10% SPEED (agile in trees)
  },
  [EnemyRegion.MOUNTAIN]: {
    hpMult: 1.15, // +15% HP (endurance)
    atkMult: 1.05, // +5% ATK
    defMult: 1.1, // +10% DEF (rocky armor)
    speedMult: 0.85, // -15% SPEED (rugged terrain)
  },
  [EnemyRegion.COASTAL]: {
    hpMult: 1.0, // Neutral
    atkMult: 1.05, // +5% ATK
    defMult: 0.95, // -5% DEF
    speedMult: 1.2, // +20% SPEED (aquatic agility)
  },
  [EnemyRegion.SWAMP]: {
    hpMult: 1.1, // +10% HP (resilient)
    atkMult: 0.9, // -10% ATK (sluggish)
    defMult: 1.15, // +15% DEF (thick skin)
    speedMult: 0.8, // -20% SPEED (mud slows movement)
  },
  [EnemyRegion.PLAINS]: {
    hpMult: 1.0, // Neutral
    atkMult: 1.0, // Neutral
    defMult: 1.0, // Neutral
    speedMult: 1.05, // +5% SPEED (open terrain)
  },
  [EnemyRegion.VOLCANIC]: {
    hpMult: 0.95, // -5% HP (harsh environment)
    atkMult: 1.2, // +20% ATK (fire damage)
    defMult: 1.1, // +10% DEF (heat resistance)
    speedMult: 1.0, // Neutral
  },
  [EnemyRegion.UNDERGROUND]: {
    hpMult: 1.05, // +5% HP
    atkMult: 0.95, // -5% ATK
    defMult: 1.2, // +20% DEF (hardened shell)
    speedMult: 0.9, // -10% SPEED (cramped spaces)
  },
  [EnemyRegion.URBAN]: {
    hpMult: 0.9, // -10% HP (less natural)
    atkMult: 1.15, // +15% ATK (tools/weapons)
    defMult: 0.9, // -10% DEF (less armor)
    speedMult: 1.1, // +10% SPEED (agile)
  },
};

// ============================================================================
// TIER MULTIPLIERS
// ============================================================================

/**
 * Tier multipliers - Applied after region multipliers
 * Determines final difficulty scaling
 */
export const TIER_MULTIPLIERS: Record<EnemyTier, number> = {
  [EnemyTier.COMMON]: 1.0, // Base (no multiplier)
  [EnemyTier.ELITE]: 1.5, // +50% to all stats
  [EnemyTier.BOSS]: 2.5, // +150% to all stats
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get stat preset by name
 */
export function getStatPreset(preset: StatPreset | string): StatPresetTemplate {
  const normalized = preset.toLowerCase() as StatPreset;
  return STAT_PRESETS[normalized] || STAT_PRESETS[StatPreset.BALANCED];
}

/**
 * Get region multipliers
 */
export function getRegionMultipliers(region: EnemyRegion | string): RegionMultipliers {
  const normalized = region.toLowerCase() as EnemyRegion;
  return REGION_MULTIPLIERS[normalized] || REGION_MULTIPLIERS[EnemyRegion.PLAINS];
}

/**
 * Get tier multiplier
 */
export function getTierMultiplier(tier: EnemyTier | string): number {
  const normalized = tier.toLowerCase() as EnemyTier;
  return TIER_MULTIPLIERS[normalized] || TIER_MULTIPLIERS[EnemyTier.COMMON];
}

/**
 * Validate enemy tier
 */
export function isValidEnemyTier(value: string): value is EnemyTier {
  return Object.values(EnemyTier).includes(value as EnemyTier);
}

/**
 * Validate enemy region
 */
export function isValidEnemyRegion(value: string): value is EnemyRegion {
  return Object.values(EnemyRegion).includes(value as EnemyRegion);
}

/**
 * Validate stat preset
 */
export function isValidStatPreset(value: string): value is StatPreset {
  return Object.values(StatPreset).includes(value as StatPreset);
}

