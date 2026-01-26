/**
 * Combat Engine 2.0
 * Deterministic, readable, expandable combat system
 * v0.36.35 - Combat Engine 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { computeHeroStats } from '@/lib/rpg/stats';
import { getEquippedCompanionBonuses, grantCompanionXP } from '@/lib/rpg/companion';
import { addItemToInventory } from './itemService';

export interface PlayerStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  crit: number;
  luck: number;
}

export interface EnemyTemplate {
  id: string;
  name: string;
  level: number;
  power: number;
  defense: number;
  maxHp: number;
  rarity: 'common' | 'elite' | 'boss';
  lootTable: {
    common?: string[];
    rare?: string[];
    epic?: string[];
    gold: { min: number; max: number };
  };
  icon?: string | null;
}

export interface FightLog {
  round: number;
  actor: 'user' | 'enemy';
  action: 'attack' | 'dodge' | 'crit';
  value: number;
  crit?: boolean;
  userHp?: number;
  enemyHp?: number;
}

export interface FightResult {
  result: 'win' | 'loss';
  rounds: number;
  logs: FightLog[];
  xpReward: number;
  goldReward: number;
  items: Array<{ itemId: string; quantity: number }>;
  petXpGained: number;
}

/**
 * Load player stats (base + equipment + pet + buffs)
 */
export async function loadStats(userId: string): Promise<PlayerStats> {
  // Get base stats from computed hero stats
  const computedStats = await computeHeroStats(userId);
  
  // Get equipped items bonuses
  const equippedItems = await prisma.userItem.findMany({
    where: {
      userId,
      equipped: true,
    },
    include: {
      item: true,
    },
  });

  let attackBonus = 0;
  let defenseBonus = 0;
  let critBonus = 0;
  let speedBonus = 0;

  for (const userItem of equippedItems) {
    const item = userItem.item;
    if (item.power) {
      attackBonus += item.power;
    }
    if (item.bonus && typeof item.bonus === 'object') {
      const bonus = item.bonus as any;
      if (bonus.attack) attackBonus += bonus.attack;
      if (bonus.defense) defenseBonus += bonus.defense;
      if (bonus.critChance) critBonus += bonus.critChance;
      if (bonus.speed) speedBonus += bonus.speed;
    }
  }

  // Get pet bonuses
  const companionBonuses = await getEquippedCompanionBonuses(userId);

  // Combine all stats
  return {
    hp: computedStats.maxHp,
    attack: computedStats.attackPower + attackBonus + (companionBonuses.atkBonus || 0),
    defense: computedStats.defense + defenseBonus + (companionBonuses.defBonus || 0),
    speed: computedStats.speed + speedBonus + (companionBonuses.speedBonus || 0),
    crit: computedStats.critChance + critBonus + (companionBonuses.critBonus || 0),
    luck: computedStats.speed + (companionBonuses.luckBonus || 0),
  };
}

/**
 * Calculate damage formula: max(1, (attack - defense))
 */
function calculateDamage(attack: number, defense: number): number {
  return Math.max(1, attack - defense);
}

/**
 * Check if crit occurs
 */
function checkCrit(critChance: number): boolean {
  return Math.random() * 100 < critChance;
}

/**
 * Check if dodge occurs (dodgeChance = speed * 0.5%)
 */
function checkDodge(speed: number): boolean {
  const dodgeChance = speed * 0.5;
  return Math.random() * 100 < dodgeChance;
}

/**
 * Simulate turn-based fight
 * User always starts first
 */
export async function simulateFight(
  userId: string,
  enemyId: string
): Promise<FightResult> {
  // Load player stats
  const playerStats = await loadStats(userId);
  
  // Load enemy template
  const enemy = await prisma.enemy.findUnique({
    where: { id: enemyId },
  });

  if (!enemy) {
    throw new Error('Enemy not found');
  }

  // Parse loot table
  const lootTable = (enemy.lootTable as any) || {
    common: [],
    rare: [],
    epic: [],
    gold: { min: 0, max: 0 },
  };

  // Initialize combat state
  let userHp = playerStats.hp;
  let enemyHp = enemy.maxHp;
  const logs: FightLog[] = [];
  let round = 0;
  const maxRounds = 100; // Safety limit

  // User always starts
  let isUserTurn = true;

  while (userHp > 0 && enemyHp > 0 && round < maxRounds) {
    round++;

    if (isUserTurn) {
      // User's turn - attack enemy (no enemy dodge per spec)
      const crit = checkCrit(playerStats.crit);
      let damage = calculateDamage(playerStats.attack, enemy.defense);
      
      if (crit) {
        damage = Math.floor(damage * 1.5); // Crit multiplier
        logs.push({
          round,
          actor: 'user',
          action: 'crit',
          value: damage,
          crit: true,
          userHp,
          enemyHp: Math.max(0, enemyHp - damage),
        });
      } else {
        logs.push({
          round,
          actor: 'user',
          action: 'attack',
          value: damage,
          crit: false,
          userHp,
          enemyHp: Math.max(0, enemyHp - damage),
        });
      }
      
      enemyHp = Math.max(0, enemyHp - damage);
    } else {
      // Enemy's turn - user tries to dodge
      const dodge = checkDodge(playerStats.speed);
      
      if (dodge) {
        logs.push({
          round,
          actor: 'user',
          action: 'dodge',
          value: 0,
          userHp,
          enemyHp,
        });
      } else {
        const damage = calculateDamage(enemy.power, playerStats.defense);
        logs.push({
          round,
          actor: 'enemy',
          action: 'attack',
          value: damage,
          crit: false,
          userHp: Math.max(0, userHp - damage),
          enemyHp,
        });
        
        userHp = Math.max(0, userHp - damage);
      }
    }

    // Check for death
    if (userHp <= 0 || enemyHp <= 0) {
      break;
    }

    // Switch turns
    isUserTurn = !isUserTurn;
  }

  // Determine result
  const result: 'win' | 'loss' = userHp > 0 ? 'win' : 'loss';

  // Calculate rewards (only if win)
  let xpReward = 0;
  let goldReward = 0;
  const items: Array<{ itemId: string; quantity: number }> = [];
  let petXpGained = 0;

  if (result === 'win') {
    // XP reward: enemy.level * 5
    xpReward = enemy.level * 5;

    // Gold reward: random from lootTable.gold range
    goldReward = Math.floor(
      Math.random() * (lootTable.gold.max - lootTable.gold.min + 1) + lootTable.gold.min
    );

    // Item drops: weighted loot
    const roll = Math.random() * 100;
    let itemPool: string[] = [];
    
    if (roll < 2) {
      // Epic: 2%
      itemPool = lootTable.epic || [];
    } else if (roll < 20) {
      // Rare: 18%
      itemPool = lootTable.rare || [];
    } else {
      // Common: 80%
      itemPool = lootTable.common || [];
    }

    if (itemPool.length > 0) {
      const randomItemId = itemPool[Math.floor(Math.random() * itemPool.length)];
      items.push({ itemId: randomItemId, quantity: 1 });
    }

    // Pet XP: +2 per fight
    petXpGained = 2;
  }

  return {
    result,
    rounds: round,
    logs,
    xpReward,
    goldReward,
    items,
    petXpGained,
  };
}

/**
 * Grant fight rewards to user
 */
export async function grantFightRewards(
  userId: string,
  fightResult: FightResult
): Promise<void> {
  if (fightResult.result !== 'win') {
    return;
  }

  // Grant XP
  if (fightResult.xpReward > 0) {
    const { addXP } = await import('@/lib/services/progressionService');
    await addXP(userId, fightResult.xpReward, 'fight');
  }

  // Grant gold
  if (fightResult.goldReward > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        funds: { increment: fightResult.goldReward },
      },
    });
  }

  // Grant items
  for (const itemReward of fightResult.items) {
    await addItemToInventory(userId, itemReward.itemId, itemReward.quantity);
  }

  // Grant pet XP
  if (fightResult.petXpGained > 0) {
    await grantCompanionXP(userId, fightResult.petXpGained);
  }

  // Update battlepass missions (v0.36.35)
  if (fightResult.result === 'win') {
    try {
      const { addBattlePassXP } = await import('@/lib/services/battlepassService');
      const { updateMissionProgress } = await import('@/lib/services/missionService');
      
      // Add battlepass XP for fight win
      await addBattlePassXP(userId, 40);
      
      // Update mission progress
      await updateMissionProgress(userId, 'daily_win_fight', 1);
      await updateMissionProgress(userId, 'weekly_win_fights', 1);
    } catch (error) {
      logger.debug('[CombatEngine] Battlepass integration failed', error);
    }
  }

  logger.info('[CombatEngine] Rewards granted', {
    userId,
    xp: fightResult.xpReward,
    gold: fightResult.goldReward,
    items: fightResult.items.length,
    petXp: fightResult.petXpGained,
  });
}

