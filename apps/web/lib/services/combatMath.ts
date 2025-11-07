/**
 * Combat Math - Stat-based combat calculations
 * v0.26.10 - Stat Influence & Combat Scaling
 * 
 * Handles damage, crit, dodge, HP, and healing calculations using user stats
 */

import { logger } from '@/lib/logger';

export interface UserStats {
  str?: number; // Strength - affects damage
  int?: number; // Intelligence - affects XP gains
  dex?: number; // Dexterity - affects dodge chance
  vit?: number; // Vitality - affects HP and healing
  luck?: number; // Luck - affects crit chance
  cha?: number; // Charisma - affects gold gains
}

export interface CombatMathResult {
  damage: number;
  isCrit: boolean;
  critMultiplier: number;
  message?: string;
}

export interface DodgeResult {
  dodged: boolean;
  message?: string;
}

/**
 * Calculate base damage with STR bonus and variance
 */
function calculateBaseDamage(str: number = 0): number {
  const dmgBase = Math.random() * (16 - 8 + 1) + 8;
  const strBonus = str * 0.8;
  
  // Apply variance ±15%
  const variance = (Math.random() * 0.3 - 0.15); // -15% to +15%
  const finalBase = Math.floor((dmgBase + strBonus) * (1 + variance));
  
  return Math.max(1, finalBase); // Minimum 1 damage
}

/**
 * Calculate crit chance from LUCK stat
 * Clamped between 5% and 50%
 */
function calculateCritChance(luck: number = 0): number {
  const baseChance = 0.05; // 5% base
  const luckBonus = luck * 0.003; // 0.3% per luck point
  const critChance = baseChance + luckBonus;
  
  // Clamp between 5% and 50%
  return Math.max(0.05, Math.min(0.5, critChance));
}

/**
 * Calculate crit multiplier from STR stat
 */
function calculateCritMultiplier(str: number = 0): number {
  const baseMult = 1.5;
  const strBonus = str * 0.01; // +1% per STR point
  return baseMult + strBonus;
}

/**
 * Calculate total damage with all modifiers
 * 
 * Formula: (baseDamage + STR bonus + item power) * crit multiplier (if crit)
 */
export function calculateStatBasedDamage(
  stats: UserStats,
  itemPower: number = 0,
  itemDamageMult: number = 1.0,
  itemCritChance: number = 0
): CombatMathResult {
  const str = stats.str || 0;
  const luck = stats.luck || 0;
  
  // Base damage calculation
  const baseDamage = calculateBaseDamage(str);
  
  // Item power bonus (flat addition)
  const powerBonus = itemPower * 1.0;
  
  // Crit calculation
  const critChance = calculateCritChance(luck) + itemCritChance;
  const isCrit = Math.random() < critChance;
  const critMult = isCrit ? calculateCritMultiplier(str) : 1.0;
  
  // Total damage before multiplier
  const preMultDamage = baseDamage + powerBonus;
  
  // Apply crit multiplier
  let totalDamage = Math.floor(preMultDamage * critMult);
  
  // Apply item damage multiplier
  totalDamage = Math.floor(totalDamage * itemDamageMult);
  
  // Cap overall damage multiplier ≤3× base to prevent one-shots
  const damageCap = baseDamage * 3;
  totalDamage = Math.min(totalDamage, damageCap);
  
  // Log calculated values for debugging
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_COMBAT === 'true') {
    logger.debug('[CombatMath] Damage calculation', {
      str,
      luck,
      itemPower,
      baseDamage,
      powerBonus,
      critChance: critChance.toFixed(3),
      isCrit,
      critMult: isCrit ? critMult.toFixed(2) : 1.0,
      totalDamage,
    });
  }
  
  return {
    damage: totalDamage,
    isCrit,
    critMultiplier: isCrit ? critMult : 1.0,
  };
}

/**
 * Calculate dodge chance from DEX stat
 * Clamped between 0% and 35%
 */
export function calculateDodgeChance(dex: number = 0): number {
  const baseChance = 0.02; // 2% base
  const dexBonus = dex * 0.004; // 0.4% per DEX point
  const dodgeChance = baseChance + dexBonus;
  
  // Clamp between 0% and 35%
  return Math.max(0, Math.min(0.35, dodgeChance));
}

/**
 * Check if attack is dodged
 */
export function checkDodge(dex: number = 0): DodgeResult {
  const dodgeChance = calculateDodgeChance(dex);
  const dodged = Math.random() < dodgeChance;
  
  if (dodged) {
    return {
      dodged: true,
      message: '💨 You dodged!',
    };
  }
  
  return { dodged: false };
}

/**
 * Calculate hero max HP from VIT stat
 * Formula: baseHP + VIT * 10
 */
export function calculateMaxHP(baseHP: number, vit: number = 0): number {
  const vitBonus = vit * 10;
  return baseHP + vitBonus;
}

/**
 * Calculate healing from rest using VIT stat
 * Formula: baseHeal + VIT * 0.5
 */
export function calculateRestHeal(baseHeal: number, vit: number = 0): number {
  const vitBonus = vit * 0.5;
  return Math.floor(baseHeal + vitBonus);
}

/**
 * Calculate HP regen per turn from VIT stat
 * Formula: VIT * 0.2
 */
export function calculateRegenPerTurn(vit: number = 0): number {
  return Math.floor(vit * 0.2);
}

/**
 * Calculate XP bonus multiplier from INT stat
 * Formula: 1 + INT * 0.02
 */
export function calculateXPBonus(int: number = 0): number {
  return 1 + int * 0.02;
}

/**
 * Calculate gold bonus multiplier from CHA stat
 * Formula: 1 + CHA * 0.015
 */
export function calculateGoldBonus(cha: number = 0): number {
  return 1 + cha * 0.015;
}

/**
 * Get stat summary for debugging/UI display
 */
export function getStatSummary(stats: UserStats): {
  damageBonus: number;
  critChance: number;
  critMultiplier: number;
  dodgeChance: number;
  hpBonus: number;
  xpBonus: number;
  goldBonus: number;
} {
  const str = stats.str || 0;
  const int = stats.int || 0;
  const dex = stats.dex || 0;
  const vit = stats.vit || 0;
  const luck = stats.luck || 0;
  const cha = stats.cha || 0;
  
  return {
    damageBonus: Math.floor(str * 0.8),
    critChance: calculateCritChance(luck),
    critMultiplier: calculateCritMultiplier(str),
    dodgeChance: calculateDodgeChance(dex),
    hpBonus: vit * 10,
    xpBonus: calculateXPBonus(int),
    goldBonus: calculateGoldBonus(cha),
  };
}

