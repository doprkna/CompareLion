/**
 * Fight Engine - Deterministic turn-based combat system
 * v0.36.0 - Full Fighting System MVP
 */

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  str: number; // Strength
  def: number; // Defense
  speed: number; // Speed (determines turn order)
}

export interface RoundLog {
  round: number;
  attacker: string; // Combatant id
  defender: string; // Combatant id
  damage: number;
  attackerHpAfter: number;
  defenderHpAfter: number;
}

export interface FightResult {
  winner: string; // Combatant id
  rounds: RoundLog[];
  totalRounds: number;
}

/**
 * Calculate damage using formula:
 * damage = max(1, (attacker.str + random(-2,+3)) - defender.def * 0.4)
 */
function calculateDamage(attacker: Combatant, defender: Combatant): number {
  const randomBonus = Math.floor(Math.random() * 6) - 2; // -2 to +3
  const baseDamage = attacker.str + randomBonus;
  const defenseReduction = defender.def * 0.4;
  const damage = Math.max(1, Math.floor(baseDamage - defenseReduction));
  return damage;
}

/**
 * Simulate a turn-based fight between hero and enemy
 */
export function simulateFight(hero: Combatant, enemy: Combatant): FightResult {
  const rounds: RoundLog[] = [];
  
  // Determine first attacker by speed (higher speed goes first)
  let currentAttacker: Combatant = hero.speed >= enemy.speed ? hero : enemy;
  let currentDefender: Combatant = currentAttacker === hero ? enemy : hero;
  
  // Clone combatants to avoid mutating originals
  let heroHp = hero.hp;
  let enemyHp = enemy.hp;
  
  let round = 1;
  const maxRounds = 100; // Safety limit to prevent infinite loops
  
  while (heroHp > 0 && enemyHp > 0 && round <= maxRounds) {
    // Calculate damage
    const damage = calculateDamage(currentAttacker, currentDefender);
    
    // Apply damage
    if (currentAttacker === hero) {
      enemyHp = Math.max(0, enemyHp - damage);
    } else {
      heroHp = Math.max(0, heroHp - damage);
    }
    
    // Log round
    rounds.push({
      round,
      attacker: currentAttacker.id,
      defender: currentDefender.id,
      damage,
      attackerHpAfter: currentAttacker === hero ? heroHp : enemyHp,
      defenderHpAfter: currentAttacker === hero ? enemyHp : heroHp,
    });
    
    // Check for winner
    if (heroHp <= 0) {
      return {
        winner: enemy.id,
        rounds,
        totalRounds: round,
      };
    }
    
    if (enemyHp <= 0) {
      return {
        winner: hero.id,
        rounds,
        totalRounds: round,
      };
    }
    
    // Swap attacker/defender for next round
    const temp = currentAttacker;
    currentAttacker = currentDefender;
    currentDefender = temp;
    
    round++;
  }
  
  // Safety fallback (shouldn't happen)
  const winner = heroHp > enemyHp ? hero.id : enemy.id;
  return {
    winner,
    rounds,
    totalRounds: round - 1,
  };
}

