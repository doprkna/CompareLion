/**
 * Combat Arena API - Fight Endpoint
 * Handles turn-based combat fights
 * v0.36.5 - Combat core + fight UI
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync } from '@/lib/api-handler';
import { successResponse, unauthorizedError, validationError } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { resolveFight, HeroStats, EnemyStats } from '@/lib/combatCore';
import { addXP } from '@/lib/services/progressionService';
import { checkAndUnlockAchievements } from '@/lib/services/achievementChecker';
import { computeHeroStats } from '@/lib/rpg/stats';
import { generateEnemy } from '@/lib/rpg/enemyGenerator';
import { rollRewardsForFight, grantRewardItem } from '@/lib/rpg/rewards';
import { getActiveEvents, applyEventsToHero, applyEventsToRewards, applyEventsToEnemy } from '@/lib/rpg/eventEngine';
import { advanceAdventure } from '@/lib/rpg/adventure';
import { getEquippedCompanionBonuses, grantCompanionXP } from '@/lib/rpg/companion';
import { logger } from '@/lib/logger';
import { logEvent } from '@/lib/services/combatLogService';

export const runtime = 'nodejs';

const FightSchema = z.object({
  enemyId: z.string().optional(), // Optional - if not provided, generate procedural enemy
  tier: z.enum(['EASY', 'NORMAL', 'HARD', 'ELITE']).optional(), // Optional tier override
  adventure: z.boolean().optional(), // Adventure mode flag (v0.36.16)
});

/**
 * Get hero stats using canonical stat engine
 */
async function getHeroStats(userId: string): Promise<HeroStats> {
  const computedStats = await computeHeroStats(userId);
  
  // Map computed stats to HeroStats interface for combat core
  // Convert attackPower to str, use defense as def, speed as speed proxy
  return {
    str: computedStats.attackPower,
    int: Math.floor(computedStats.maxHp / 10), // Approximate INT from HP
    cha: computedStats.defense,
    luck: computedStats.critChance + computedStats.speed, // Combined crit + speed
    hp: computedStats.maxHp,
    maxHp: computedStats.maxHp,
    weaponDamage: Math.floor(computedStats.attackPower * 0.1), // 10% of attack as weapon bonus
  };
}

/**
 * POST /api/arena/fight
 * Start a fight with an enemy
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in to fight');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = FightSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid request'
    );
  }

  const { enemyId, tier, adventure } = validation.data;

  // Get hero stats first (needed for enemy generation)
  const baseComputedStats = await computeHeroStats(user.id);
  
  // Get active events (v0.36.15)
  const activeEvents = await getActiveEvents();
  
  // Apply events to hero stats
  const computedHeroStats = applyEventsToHero(baseComputedStats, activeEvents);
  const heroStats = await getHeroStats(user.id);
  
  // Apply events to hero stats mapping (update heroStats with event-modified computed stats)
  heroStats.str = computedHeroStats.attackPower;
  heroStats.cha = computedHeroStats.defense;
  heroStats.hp = computedHeroStats.maxHp;
  heroStats.maxHp = computedHeroStats.maxHp;
  heroStats.luck = computedHeroStats.critChance + computedHeroStats.speed;

  // Generate or fetch enemy
  let generatedEnemy;
  let enemyStats: EnemyStats;

  if (enemyId) {
    // Use existing enemy from DB (backward compatibility)
    const enemy = await prisma.enemy.findUnique({
      where: { id: enemyId },
    });

    if (!enemy) {
      return validationError('Enemy not found');
    }

    const baseEnemyStats = {
      hp: enemy.hp,
      atk: enemy.str,
      def: enemy.def,
    };
    
    // Apply events to enemy stats (v0.36.15)
    const modifiedEnemyStats = applyEventsToEnemy(baseEnemyStats, activeEvents);
    
    enemyStats = {
      id: enemy.id,
      name: enemy.name,
      hp: modifiedEnemyStats.hp,
      maxHp: modifiedEnemyStats.hp,
      str: modifiedEnemyStats.atk,
      def: modifiedEnemyStats.def || enemy.def,
      speed: enemy.speed,
    };
    generatedEnemy = null; // Not a generated enemy
  } else {
    // Generate procedural enemy
    generatedEnemy = await generateEnemy(baseComputedStats, { tier });
    
    const baseEnemyStats = {
      hp: generatedEnemy.stats.hp,
      atk: generatedEnemy.stats.atk,
      def: generatedEnemy.stats.def,
    };
    
    // Apply events to enemy stats (v0.36.15)
    const modifiedEnemyStats = applyEventsToEnemy(baseEnemyStats, activeEvents);
    
    enemyStats = {
      id: `generated-${Date.now()}`, // Temporary ID
      name: generatedEnemy.name,
      hp: modifiedEnemyStats.hp,
      maxHp: modifiedEnemyStats.hp,
      str: modifiedEnemyStats.atk,
      def: modifiedEnemyStats.def || generatedEnemy.stats.def,
      speed: generatedEnemy.stats.speed,
    };
  }

  // Resolve fight
  const fightResult = resolveFight(heroStats, enemyStats);

  // Generate fightId for logging
  const fightId = `fight-${user.id}-${Date.now()}`;
  const enemyIdForLog = enemyId || `generated-${enemyStats.id}`;

  // Log combat events (v0.36.27)
  try {
    for (const round of fightResult.rounds) {
      // Log player action
      if (round.heroDamage > 0 || round.heroMiss) {
        await logEvent({
          userId: user.id,
          enemyId: enemyIdForLog,
          fightId,
          round: round.roundIndex,
          actor: 'player',
          action: round.heroCrit ? 'crit' : round.heroMiss ? 'miss' : 'attack',
          value: round.heroDamage || undefined,
          hpAfter: round.enemyHp,
        });
      }

      // Log enemy action
      if (round.enemyDamage > 0 || round.enemyMiss) {
        await logEvent({
          userId: user.id,
          enemyId: enemyIdForLog,
          fightId,
          round: round.roundIndex,
          actor: 'enemy',
          action: round.enemyCrit ? 'crit' : round.enemyMiss ? 'miss' : 'attack',
          value: round.enemyDamage || undefined,
          hpAfter: round.heroHp,
        });
      }
    }
  } catch (error) {
    logger.warn('[Arena] Failed to log combat events', error);
    // Don't fail the fight if logging fails
  }

  // Calculate max damage dealt in this fight
  const maxDamage = fightResult.rounds.reduce((max, round) => 
    Math.max(max, round.heroDamage), 0
  );

  // Get current user data for achievement context
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      level: true,
      totalFightsWon: true,
      totalDamageDealt: true,
      funds: true,
    },
  });

  // Apply rewards if hero won
  if (fightResult.result === "WIN") {
    // Fetch loot table rows for enemy
    // For generated enemies, we don't have a DB enemyId, so use empty array
    // In future, we could create loot tables for archetypes
    const lootTableRows = generatedEnemy 
      ? [] 
      : await prisma.lootTable.findMany({
          where: { enemyId: enemy.id },
        });

    // Determine enemy tier (normalize to lowercase)
    const enemyTier = generatedEnemy 
      ? (generatedEnemy.tier.toLowerCase() as 'easy' | 'normal' | 'hard' | 'elite')
      : 'normal';

    // Roll rewards using new reward engine
    const baseRewards = await rollRewardsForFight({
      hero: baseComputedStats, // Use base stats for reward calculation
      enemy: generatedEnemy || { 
        id: enemy.id, 
        xpReward: (enemy as any).xpReward, 
        goldReward: (enemy as any).goldReward 
      },
      enemyTier,
      lootTableRows: lootTableRows.map(row => ({
        id: row.id,
        enemyId: row.enemyId,
        itemId: row.itemId,
        weight: row.weight,
        minGold: row.minGold,
        maxGold: row.maxGold,
        minXp: row.minXp,
        maxXp: row.maxXp,
      })),
    });
    
    // Apply events to rewards (v0.36.15)
    const eventRewards = applyEventsToRewards(
      { xp: baseRewards.xp, gold: baseRewards.gold },
      activeEvents
    );
    
    // Apply companion bonuses to rewards (v0.36.17)
    const companionBonuses = await getEquippedCompanionBonuses(user.id);
    const rewards = {
      xp: Math.floor(eventRewards.xp * (1 + companionBonuses.xpBonus / 100)),
      gold: Math.floor(eventRewards.gold * (1 + companionBonuses.goldBonus / 100)),
    };
    
    // Add XP (includes season pass integration) (v0.36.23)
    await addXP(user.id, rewards.xp, 'fight');
    
    // Add battlepass XP (v0.36.28)
    try {
      const { addBattlePassXP } = await import('@/lib/services/battlepassService');
      const { updateMissionProgress } = await import('@/lib/services/missionService');
      await addBattlePassXP(user.id, 40); // +40 XP for fight win
      await updateMissionProgress(user.id, 'daily_win_fight', 1);
      await updateMissionProgress(user.id, 'weekly_win_fights', 1);
    } catch (error) {
      logger.debug('[Arena] Battlepass XP failed', error);
    }
    
    // Grant companion XP (20% of hero XP) (v0.36.17)
    await grantCompanionXP(user.id, rewards.xp);
    
    // Add gold
    await prisma.user.update({
      where: { id: user.id },
      data: {
        funds: {
          increment: rewards.gold,
        },
        totalFightsWon: {
          increment: 1,
        },
        totalDamageDealt: {
          increment: maxDamage,
        },
      },
    });
    
    // Grant items if any (v0.36.34 - Standardized items array)
    const grantedItems: Array<{ itemId: string; quantity: number }> = [];
    let itemId: string | undefined; // Legacy field
    let itemName: string | undefined; // Legacy field
    let itemRarity: string | undefined; // Legacy field
    
    if (baseRewards.items && baseRewards.items.length > 0) {
      const { addItemToInventory } = await import('@/lib/services/itemService');
      for (const itemReward of baseRewards.items) {
        await addItemToInventory(user.id, itemReward.itemId, itemReward.quantity);
        grantedItems.push(itemReward);
        
        // Set legacy fields from first item for backward compatibility
        if (!itemId && baseRewards.item) {
          itemId = baseRewards.item.id;
          itemName = baseRewards.item.name;
          itemRarity = baseRewards.item.rarity;
        }
      }
    } else if (baseRewards.item) {
      // Legacy: single item support
      const grantedItem = await grantRewardItem(user.id, baseRewards.item.id);
      if (grantedItem) {
        itemId = grantedItem.id;
        itemName = baseRewards.item.name;
        itemRarity = baseRewards.item.rarity;
        grantedItems.push({ itemId: baseRewards.item.id, quantity: 1 });
      }
    }

    // Process loot drop from new loot system (v0.36.30)
    let lootDrop: any = null;
    try {
      const { processFightDrop } = await import('@/lib/services/lootService');
      const enemyType = generatedEnemy?.type || enemy?.type || undefined;
      lootDrop = await processFightDrop(user.id, fightId, enemyType);
      if (lootDrop) {
        // If we got a loot drop, include it in rewards (may be in addition to existing item)
        logger.info(`[Fight] Loot drop: ${lootDrop.rarity} ${lootDrop.itemName} for user ${user.id}`);
      }
    } catch (error) {
      logger.debug('[Fight] Loot drop processing failed', error);
      // Don't fail the fight if loot drop fails
    }
    
    fightResult.rewards = {
      xp: rewards.xp,
      gold: rewards.gold,
      items: grantedItems, // v0.36.34 - Standardized items array
      itemId, // Legacy field
      item: baseRewards.item ? {
        id: baseRewards.item.id,
        name: baseRewards.item.name,
        rarity: baseRewards.item.rarity,
      } : null, // Legacy field
      lootDrop: lootDrop ? {
        itemId: lootDrop.itemId,
        itemName: lootDrop.itemName,
        rarity: lootDrop.rarity,
        item: lootDrop.item,
      } : null,
    };

    // Advance adventure if in adventure mode (v0.36.16)
    let adventureAdvanced = false;
    if (adventure) {
      try {
        await advanceAdventure(user.id);
        adventureAdvanced = true;
        logger.info(`[Fight] Advanced adventure for user ${user.id}`);
      } catch (error) {
        logger.warn(`[Fight] Failed to advance adventure for user ${user.id}`, error);
        // Don't fail the fight if adventure advancement fails
      }
    }

    // Check and unlock achievements
    await checkAndUnlockAchievements(user.id, {
      fightsWon: (currentUser?.totalFightsWon || 0) + 1,
      damageDealt: maxDamage,
      heroHpRemaining: fightResult.rounds[fightResult.rounds.length - 1]?.heroHp || 0,
      heroLevel: currentUser?.level || 1,
      totalGoldEarned: (currentUser?.funds || 0) + rewards.gold,
      hasBoughtSomething: false,
      questCompleted: false,
      streak: 0,
      enemyTier: generatedEnemy?.tier,
      enemyVariant: generatedEnemy?.variant,
    });
  }

  // Get updated hero stats
  const updatedHero = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      level: true,
      xp: true,
      funds: true,
      stats: true,
    },
  });

  // Get inventory items
  const inventory = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      itemKey: true,
      rarity: true,
      power: true,
      equipped: true,
    },
  });

  // Add battlepass XP for fight loss (v0.36.28)
  if (fightResult.result === 'LOSE') {
    try {
      const { addBattlePassXP } = await import('@/lib/services/battlepassService');
      await addBattlePassXP(user.id, 15); // +15 XP for fight loss
    } catch (error) {
      logger.debug('[Arena] Battlepass XP failed', error);
    }
  }

  logger.info(`[Arena] User ${user.id} fought enemy ${enemyId || generatedEnemy?.name}, result: ${fightResult.result}`);

  return successResponse({
    fight: {
      ...fightResult,
      fightId, // Include fightId for UI to fetch logs
    },
    hero: updatedHero,
    inventory,
    rewards: fightResult.rewards,
    enemy: generatedEnemy ? {
      name: generatedEnemy.name,
      level: generatedEnemy.level,
      tier: generatedEnemy.tier,
      variant: generatedEnemy.variant,
      stats: generatedEnemy.stats,
    } : undefined,
    adventureAdvanced, // v0.36.16
  });
});

