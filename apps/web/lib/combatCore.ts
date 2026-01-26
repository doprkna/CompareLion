/**
 * Combat Core - Pure function for resolving fights
 * v0.36.5 - Combat core + fight UI
 */

export interface HeroStats {
  str: number; // Attack power
  int: number; // HP proxy
  cha: number; // Defense
  luck: number; // Crit + Speed combined
  hp: number;
  maxHp: number;
  weaponDamage?: number; // Optional weapon damage bonus
  // New fields for unified stats
  attackPower?: number;
  defense?: number;
  critChance?: number;
  speed?: number;
}

export interface EnemyStats {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  str: number;
  def: number;
  speed: number;
}

export interface Round {
  roundIndex: number;
  heroHp: number;
  enemyHp: number;
  heroDamage: number;
  enemyDamage: number;
  heroCrit: boolean;
  enemyCrit: boolean;
  heroMiss: boolean;
  enemyMiss: boolean;
}

export interface FightResult {
  rounds: Round[];
  result: "WIN" | "LOSE" | "DRAW";
  rewards?: {
    xp?: number;
    gold?: number;
    itemId?: string;
  };
}

/**
 * Calculate damage with STR/AGI scaling + weapon damage
 * Formula: baseDamage + STR scaling + weaponDamage, with RNG for crit/miss
 */
function calculateHeroDamage(hero: HeroStats, enemy: EnemyStats): {
  damage: number;
  crit: boolean;
  miss: boolean;
} {
  // Base damage from STR
  const baseDamage = Math.max(1, Math.floor(hero.str * 0.8));
  
  // AGI (using luck as agility proxy) affects hit chance
  const hitChance = Math.min(0.95, 0.7 + (hero.luck * 0.01));
  const miss = Math.random() > hitChance;
  
  if (miss) {
    return { damage: 0, crit: false, miss: true };
  }
  
  // Crit chance from luck
  const critChance = Math.min(0.3, 0.05 + (hero.luck * 0.005));
  const crit = Math.random() < critChance;
  
  // Weapon damage bonus
  const weaponBonus = hero.weaponDamage || 0;
  
  // Calculate final damage
  let damage = baseDamage + weaponBonus;
  
  // Apply crit multiplier (2x)
  if (crit) {
    damage = Math.floor(damage * 2);
  }
  
  // Apply defense reduction
  const defenseReduction = Math.floor(enemy.def * 0.3);
  damage = Math.max(1, damage - defenseReduction);
  
  return { damage, crit, miss: false };
}

/**
 * Calculate enemy damage
 */
function calculateEnemyDamage(enemy: EnemyStats, hero: HeroStats): {
  damage: number;
  crit: boolean;
  miss: boolean;
} {
  // Base damage from STR
  const baseDamage = Math.max(1, Math.floor(enemy.str * 0.8));
  
  // Hero luck affects dodge chance
  const dodgeChance = Math.min(0.25, hero.luck * 0.01);
  const miss = Math.random() < dodgeChance;
  
  if (miss) {
    return { damage: 0, crit: false, miss: true };
  }
  
  // Enemy crit chance (lower than hero)
  const critChance = 0.1;
  const crit = Math.random() < critChance;
  
  let damage = baseDamage;
  
  // Apply crit multiplier (1.5x for enemies)
  if (crit) {
    damage = Math.floor(damage * 1.5);
  }
  
  // No defense reduction for hero (hero doesn't have def stat in new system)
  // Could use INT as magic defense if needed
  
  return { damage, crit, miss: false };
}

/**
 * Resolve a fight between hero and enemy
 * Pure function that returns rounds and result
 */
export function resolveFight(hero: HeroStats, enemy: EnemyStats): FightResult {
  const rounds: Round[] = [];
  
  let heroHp = hero.hp;
  let enemyHp = enemy.hp;
  
  let roundIndex = 1;
  const maxRounds = 100; // Safety limit
  
  // Determine turn order by speed (enemy speed vs hero luck as speed proxy)
  const heroSpeed = hero.luck; // Using luck as speed proxy
  const heroGoesFirst = heroSpeed >= enemy.speed;
  
  while (heroHp > 0 && enemyHp > 0 && roundIndex <= maxRounds) {
    let heroDamage = 0;
    let enemyDamage = 0;
    let heroCrit = false;
    let enemyCrit = false;
    let heroMiss = false;
    let enemyMiss = false;
    
    if (heroGoesFirst) {
      // Hero attacks first
      const heroAttack = calculateHeroDamage(hero, enemy);
      heroDamage = heroAttack.damage;
      heroCrit = heroAttack.crit;
      heroMiss = heroAttack.miss;
      
      if (!heroMiss) {
        enemyHp = Math.max(0, enemyHp - heroDamage);
      }
      
      // Check if enemy is dead
      if (enemyHp <= 0) {
        rounds.push({
          roundIndex,
          heroHp,
          enemyHp: 0,
          heroDamage,
          enemyDamage: 0,
          heroCrit,
          enemyCrit: false,
          heroMiss,
          enemyMiss: false,
        });
        break;
      }
      
      // Enemy counter-attacks
      const enemyAttack = calculateEnemyDamage(enemy, hero);
      enemyDamage = enemyAttack.damage;
      enemyCrit = enemyAttack.crit;
      enemyMiss = enemyAttack.miss;
      
      if (!enemyMiss) {
        heroHp = Math.max(0, heroHp - enemyDamage);
      }
    } else {
      // Enemy attacks first
      const enemyAttack = calculateEnemyDamage(enemy, hero);
      enemyDamage = enemyAttack.damage;
      enemyCrit = enemyAttack.crit;
      enemyMiss = enemyAttack.miss;
      
      if (!enemyMiss) {
        heroHp = Math.max(0, heroHp - enemyDamage);
      }
      
      // Check if hero is dead
      if (heroHp <= 0) {
        rounds.push({
          roundIndex,
          heroHp: 0,
          enemyHp,
          heroDamage: 0,
          enemyDamage,
          heroCrit: false,
          enemyCrit,
          heroMiss: false,
          enemyMiss,
        });
        break;
      }
      
      // Hero counter-attacks
      const heroAttack = calculateHeroDamage(hero, enemy);
      heroDamage = heroAttack.damage;
      heroCrit = heroAttack.crit;
      heroMiss = heroAttack.miss;
      
      if (!heroMiss) {
        enemyHp = Math.max(0, enemyHp - heroDamage);
      }
    }
    
    rounds.push({
      roundIndex,
      heroHp,
      enemyHp,
      heroDamage,
      enemyDamage,
      heroCrit,
      enemyCrit,
      heroMiss,
      enemyMiss,
    });
    
    roundIndex++;
  }
  
  // Determine result
  let result: "WIN" | "LOSE" | "DRAW";
  if (heroHp > 0 && enemyHp <= 0) {
    result = "WIN";
  } else if (heroHp <= 0 && enemyHp > 0) {
    result = "LOSE";
  } else {
    result = "DRAW";
  }
  
  return {
    rounds,
    result,
  };
}

