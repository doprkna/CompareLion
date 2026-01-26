/**
 * Hybrid Enemy Generator
 * Procedural enemy generation with archetypes, variants, scaling, and tiers
 * v0.36.12 - Hybrid Enemy System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ComputedStats } from './stats';

// Level scaling constants (v0.36.34 - Stats 2.0)
// Enemies scale with player level: baseArchetype + (playerLevel * 0.4) per attribute
const SCALING_PER_PLAYER_LEVEL = 0.4; // +0.4 per player level (rounded)

// Tier weights (for random selection)
const TIER_WEIGHTS = {
  EASY: 10,
  NORMAL: 60,
  HARD: 25,
  ELITE: 5,
};

// Tier multipliers
const TIER_MULTIPLIERS: Record<string, number> = {
  EASY: 0.9,
  NORMAL: 1.0,
  HARD: 1.15,
  ELITE: 1.35,
};

// Tier level offsets
const TIER_LEVEL_OFFSETS: Record<string, number> = {
  EASY: -1,
  NORMAL: 0,
  HARD: 1,
  ELITE: 3,
};

// Variant definitions (in code, no DB)
export interface VariantModifier {
  name: string;
  type: 'elemental' | 'trait';
  modifiers: {
    hpMult?: number;
    atkMult?: number;
    defMult?: number;
    critAdd?: number;
    speedMult?: number;
    speedAdd?: number;
  };
}

const VARIANTS: Record<string, VariantModifier> = {
  // Elemental variants
  Fire: {
    name: 'Fire',
    type: 'elemental',
    modifiers: {
      atkMult: 1.2,
      critAdd: 5,
    },
  },
  Ice: {
    name: 'Ice',
    type: 'elemental',
    modifiers: {
      defMult: 1.25,
      speedMult: 0.9, // -10%
    },
  },
  Shadow: {
    name: 'Shadow',
    type: 'elemental',
    modifiers: {
      critAdd: 15,
      hpMult: 0.9, // -10%
    },
  },
  Earth: {
    name: 'Earth',
    type: 'elemental',
    modifiers: {
      hpMult: 1.2,
      defMult: 1.1,
    },
  },
  // Trait variants
  Swift: {
    name: 'Swift',
    type: 'trait',
    modifiers: {
      speedMult: 1.25,
    },
  },
  Armored: {
    name: 'Armored',
    type: 'trait',
    modifiers: {
      defMult: 1.3,
    },
  },
  Berserk: {
    name: 'Berserk',
    type: 'trait',
    modifiers: {
      atkMult: 1.3,
      defMult: 0.8, // -20%
    },
  },
  Corrupted: {
    name: 'Corrupted',
    type: 'trait',
    modifiers: {
      atkMult: 1.1,
      speedMult: 0.9, // -10%
      critAdd: 10,
    },
  },
};

export interface GeneratedEnemy {
  name: string;
  level: number;
  tier: string;
  variant?: string;
  stats: {
    hp: number;
    atk: number;
    def: number;
    speed: number;
    crit: number;
  };
  fullDescription: string;
  archetypeCode: string;
}

export interface EnemyArchetype {
  id: string;
  code: string;
  name: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseCrit: number;
  baseSpeed: number;
}

/**
 * Get all enemy archetypes from database
 */
async function getArchetypes(): Promise<EnemyArchetype[]> {
  const archetypes = await prisma.enemyArchetype.findMany({
    orderBy: { code: 'asc' },
  });
  return archetypes;
}

/**
 * Pick random tier based on weights
 */
function pickRandomTier(): string {
  const totalWeight = Object.values(TIER_WEIGHTS).reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (const [tier, weight] of Object.entries(TIER_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return tier;
    }
  }
  
  return 'NORMAL'; // Fallback
}

/**
 * Pick random variant (20% chance, or null)
 */
function pickRandomVariant(): string | null {
  if (Math.random() < 0.2) {
    const variantKeys = Object.keys(VARIANTS);
    return variantKeys[Math.floor(Math.random() * variantKeys.length)];
  }
  return null;
}

/**
 * Calculate enemy level based on player level and tier
 */
function calculateEnemyLevel(playerLevel: number, tier: string): number {
  const offset = TIER_LEVEL_OFFSETS[tier] || 0;
  const enemyLevel = Math.max(1, playerLevel + offset);
  return enemyLevel;
}

/**
 * Apply level scaling to base stats (v0.36.34 - Stats 2.0)
 * Enemies scale with player level: baseArchetype + (playerLevel * 0.4) per stat
 * Then derive final stats using similar formulas to players
 */
function applyLevelScaling(
  baseHp: number,
  baseAtk: number,
  baseDef: number,
  baseCrit: number,
  baseSpeed: number,
  enemyLevel: number,
  playerLevel: number
): { hp: number; atk: number; def: number; crit: number; speed: number } {
  // Scale base stats by player level (+0.4 per player level, rounded)
  const scaling = Math.round(playerLevel * SCALING_PER_PLAYER_LEVEL);
  
  // For MVP, we'll scale the existing base stats directly
  // In future, enemies could have STR/AGI/END/INT/LCK attributes
  const scaledHp = baseHp + scaling;
  const scaledAtk = baseAtk + scaling;
  const scaledDef = baseDef + scaling;
  const scaledCrit = baseCrit + Math.round(scaling * 0.5); // Crit scales slower
  const scaledSpeed = baseSpeed + Math.round(scaling * 0.3); // Speed scales slower
  
  return {
    hp: scaledHp,
    atk: scaledAtk,
    def: scaledDef,
    crit: scaledCrit,
    speed: scaledSpeed,
  };
}

/**
 * Apply variant modifiers to scaled stats
 */
function applyVariantModifiers(
  stats: { hp: number; atk: number; def: number; crit: number; speed: number },
  variantKey: string | null
): { hp: number; atk: number; def: number; crit: number; speed: number } {
  if (!variantKey || !VARIANTS[variantKey]) {
    return stats;
  }

  const variant = VARIANTS[variantKey];
  const modifiers = variant.modifiers;

  let hp = stats.hp;
  let atk = stats.atk;
  let def = stats.def;
  let crit = stats.crit;
  let speed = stats.speed;

  // Apply multipliers
  if (modifiers.hpMult) {
    hp = Math.floor(hp * modifiers.hpMult);
  }
  if (modifiers.atkMult) {
    atk = Math.floor(atk * modifiers.atkMult);
  }
  if (modifiers.defMult) {
    def = Math.floor(def * modifiers.defMult);
  }
  if (modifiers.speedMult) {
    speed = Math.floor(speed * modifiers.speedMult);
  }

  // Apply additive modifiers
  if (modifiers.critAdd) {
    crit += modifiers.critAdd;
  }
  if (modifiers.speedAdd) {
    speed += modifiers.speedAdd;
  }

  return { hp, atk, def, crit, speed };
}

/**
 * Apply tier multiplier to final stats
 */
function applyTierMultiplier(
  stats: { hp: number; atk: number; def: number; crit: number; speed: number },
  tier: string
): { hp: number; atk: number; def: number; crit: number; speed: number } {
  const multiplier = TIER_MULTIPLIERS[tier] || 1.0;
  
  return {
    hp: Math.floor(stats.hp * multiplier),
    atk: Math.floor(stats.atk * multiplier),
    def: Math.floor(stats.def * multiplier),
    crit: Math.floor(stats.crit * multiplier),
    speed: Math.floor(stats.speed * multiplier),
  };
}

/**
 * Generate enemy name
 */
function generateEnemyName(
  archetypeName: string,
  variant: string | null,
  level: number
): string {
  const variantPrefix = variant ? `${variant} ` : '';
  return `${variantPrefix}${archetypeName} (L${level})`;
}

/**
 * Generate full description
 */
function generateDescription(
  archetypeName: string,
  variant: string | null,
  tier: string,
  level: number
): string {
  const variantText = variant ? ` A ${variant.toLowerCase()} variant.` : '';
  return `A level ${level} ${tier.toLowerCase()} ${archetypeName.toLowerCase()}.${variantText}`;
}

/**
 * Generate a procedural enemy
 * @param playerStats - Player's computed stats (for level reference)
 * @param options - Optional generation options
 */
export async function generateEnemy(
  playerStats: ComputedStats,
  options?: {
    tier?: string;
    variant?: string | null;
    archetypeCode?: string;
  }
): Promise<GeneratedEnemy> {
  // 1. Get archetypes
  const archetypes = await getArchetypes();
  
  if (archetypes.length === 0) {
    throw new Error('No enemy archetypes found. Please seed archetypes first.');
  }

  // 2. Pick random archetype (or use provided)
  let archetype: EnemyArchetype;
  if (options?.archetypeCode) {
    archetype = archetypes.find(a => a.code === options.archetypeCode) || archetypes[0];
  } else {
    archetype = archetypes[Math.floor(Math.random() * archetypes.length)];
  }

  // 3. Pick random tier (or use provided)
  const tier = options?.tier || pickRandomTier();

  // 4. Pick variant (or use provided, or random)
  const variant = options?.variant !== undefined 
    ? options.variant 
    : pickRandomVariant();

  // 5. Compute enemy level based on tier
  const enemyLevel = calculateEnemyLevel(playerStats.level, tier);

  // 6. Compute scaled stats (v0.36.34 - scale by player level)
  let stats = applyLevelScaling(
    archetype.baseHp,
    archetype.baseAtk,
    archetype.baseDef,
    archetype.baseCrit,
    archetype.baseSpeed,
    enemyLevel,
    playerStats.level // Scale based on player level, not enemy level
  );

  // 7. Apply variant modifiers
  stats = applyVariantModifiers(stats, variant);

  // 8. Apply tier multiplier
  stats = applyTierMultiplier(stats, tier);

  // Ensure minimum values
  stats.hp = Math.max(1, stats.hp);
  stats.atk = Math.max(1, stats.atk);
  stats.def = Math.max(0, stats.def);
  stats.crit = Math.max(0, Math.min(100, stats.crit)); // Cap crit at 100%
  stats.speed = Math.max(1, stats.speed);

  // 9. Generate name and description
  const name = generateEnemyName(archetype.name, variant, enemyLevel);
  const fullDescription = generateDescription(archetype.name, variant, tier, enemyLevel);

  logger.debug('[EnemyGenerator] Generated enemy', {
    name,
    archetype: archetype.code,
    tier,
    variant,
    level: enemyLevel,
    stats,
  });

  return {
    name,
    level: enemyLevel,
    tier,
    variant: variant || undefined,
    stats: {
      hp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      speed: stats.speed,
      crit: stats.crit,
    },
    fullDescription,
    archetypeCode: archetype.code,
  };
}

