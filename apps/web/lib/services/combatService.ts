/**
 * Combat Service - Idle Reflection Combat System
 * Handles hero vs shadow battles, damage calculation, and rewards
 * v0.25.0 - Phase J-Lite
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { unlockAchievement } from '@/lib/services/achievementService';
import { RewardConfig } from '@/lib/config/rewardConfig';
import { calculateCombatKillReward } from '@/lib/services/rewardService';
import { applyItemEffects, getTotalItemPower, generateItem, createInventoryItem } from '@/lib/services/itemService'; // v0.26.5
import {
  calculateStatBasedDamage,
  checkDodge,
  calculateMaxHP,
  calculateRestHeal,
  calculateXPBonus,
  calculateGoldBonus,
  UserStats,
} from '@/lib/services/combatMath'; // v0.26.10
import { getArchetype } from '@/lib/config/archetypeConfig'; // v0.26.6
import { addXP } from '@/lib/services/progressionService'; // v0.26.6

// ========================================
// TYPES
// ========================================

export interface CombatResult {
  session: {
    id: string;
    heroHp: number;
    heroMaxHp: number;
    enemyHp: number;
    enemyMaxHp: number;
    enemyName: string;
    enemyType: string;
    xpGained: number;
    goldGained: number;
    kills: number;
    currentStreak: number;
  };
  combatLog: CombatLogEntry[];
  rewards?: RewardResult;
  levelUp?: LevelUpResult;
  gameOver?: boolean;
  state?: 'resting' | 'active';
}

export interface CombatLogEntry {
  type: 'attack' | 'enemyHit' | 'kill' | 'respawn' | 'gameOver' | 'rest' | 'heal';
  damage?: number;
  isCrit?: boolean;
  message: string;
  timestamp: Date;
}

export interface RewardResult {
  xp: number;
  gold: number;
  killBonus: boolean;
}

export interface LevelUpResult {
  newLevel: number;
  oldLevel: number;
  xpNeeded: number;
}

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  total: number;
}

// ========================================
// CONSTANTS
// ========================================

const HERO_BASE_HP = 100;
const ENEMY_BASE_HP = 100;

const ATTACK_BASE_MIN = 8;
const ATTACK_BASE_MAX = 16;
const CRIT_CHANCE = 0.15;
const CRIT_MULTIPLIER = 1.5;

const ENEMY_BASE_MIN = 5;
const ENEMY_BASE_MAX = 10;

// Reward values now come from RewardConfig (v0.26.1)
// Legacy constants kept for backward compatibility during migration
const XP_PER_HIT = RewardConfig.base.xp;
const GOLD_PER_HIT = RewardConfig.base.gold;
const XP_PER_KILL = RewardConfig.kill.xp;
const GOLD_PER_KILL = RewardConfig.kill.gold;

const SHADOW_NAMES = [
  'Shadow of Laziness',
  'Clone of Regret',
  'Nightmare of Procrastination',
  'Specter of Doubt',
  'Phantom of Anxiety',
  'Wraith of Distraction',
  'Echo of Yesterday',
  'Ghost of Missed Chances',
  'Mirage of Perfection',
  'Shade of Overthinking',
];

// v0.25.3 - Boss battle system (MVP)
const BOSS_NAMES = [
  '👑 Lord of Endless Scrolling',
  '👑 Duke of Comparison',
  '👑 Baron of Analysis Paralysis',
  '👑 Count of Second-Guessing',
  '👑 Empress of Perfectionism',
];

const BOSS_HP_MULTIPLIER = 2.5; // Bosses have 250 HP
// BOSS_XP_BONUS and BOSS_GOLD_BONUS now calculated via RewardConfig.boss vs RewardConfig.kill
const BOSS_INTERVAL = 10; // Boss every 10 kills

// v0.25.4 - Rest system constants
const REST_HEAL_RATE = 5; // HP per second while resting
const REST_FULL_HEAL_SECONDS = 10; // Full heal after 10 seconds

// ========================================
// SESSION MANAGEMENT
// ========================================

export async function getOrCreateSession(userId: string, applyArchetypeHPBonus: boolean = true): Promise<CombatResult> {
  try {
    // Check for existing active session
    let session = await prisma.combatSession.findFirst({
      where: { userId, isActive: true },
    });

    const combatLog: CombatLogEntry[] = [];

    // Create new session if none exists
    if (!session) {
      // Get user stats and archetype for HP calculation (v0.26.10)
      const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          archetypeKey: true,
          stats: true,
        },
      });
      
      let heroHp = HERO_BASE_HP;
      const stats = (userData?.stats || {}) as UserStats;
      
      // Calculate HP from VIT stat (v0.26.10)
      heroHp = calculateMaxHP(HERO_BASE_HP, stats.vit || 0);
      
      // Apply archetype HP multiplier if present (v0.26.6)
      if (applyArchetypeHPBonus && userData?.archetypeKey) {
        const archetype = getArchetype(userData.archetypeKey);
        if (archetype?.bonuses.combat?.hpMult) {
          heroHp = Math.floor(heroHp * archetype.bonuses.combat.hpMult);
        }
      }
      
      const enemyName = generateEnemyName(0); // Start with kill count 0
      session = await prisma.combatSession.create({
        data: {
          userId,
          heroHp,
          heroMaxHp: heroHp,
          enemyHp: ENEMY_BASE_HP,
          enemyMaxHp: ENEMY_BASE_HP,
          enemyName,
          enemyType: 'shadow',
        },
      });

      combatLog.push({
        type: 'respawn',
        message: `🌑 ${enemyName} emerges from the shadows...`,
        timestamp: new Date(),
      });

      logger.info(`[CombatService] Created new session for user ${userId}`);
    }

    return {
      session: formatSession(session),
      combatLog,
    };
  } catch (error) {
    logger.error('[CombatService] Error in getOrCreateSession', error);
    throw error;
  }
}

export async function getActiveSession(userId: string) {
  return prisma.combatSession.findFirst({
    where: { userId, isActive: true },
  });
}

// ========================================
// COMBAT ACTIONS
// ========================================

export async function attack(userId: string, powerBonus: number = 0): Promise<CombatResult> {
  try {
    const session = await getActiveSession(userId);
    if (!session) {
      return getOrCreateSession(userId);
    }

    // Check if hero is resting
    if (session.heroHp <= 0) {
      const restResult = await checkAndHealFromRest(userId, session);
      if (restResult.state === 'resting') {
        return restResult; // Still resting, cannot attack
      }
      // Fully healed, refresh session and continue attack
      const healedSession = await getActiveSession(userId);
      if (!healedSession || healedSession.heroHp <= 0) {
        return restResult; // Fallback
      }
      // Get user archetype and stats for healed attack (v0.26.10)
      const healedUserData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          archetypeKey: true,
          stats: true,
        },
      });
      
      const healedArchetype = healedUserData?.archetypeKey ? getArchetype(healedUserData.archetypeKey) : null;
      const healedStats = (healedUserData?.stats || {}) as UserStats;
      
      // Continue with healed session
      // Apply item effects for attack (v0.26.8)
      const healedItemMods = await applyItemEffects(userId, 'onAttack', {
        damageMult: 1,
        critChance: 0,
      });
      
      // Calculate stat-based damage (v0.26.10)
      const healedItemDamageMult = (healedItemMods.damageMult || 1.0) * (healedArchetype?.bonuses.combat?.damageMult || 1.0);
      const healedItemCritChance = (healedItemMods.critChance || 0) + (healedArchetype?.bonuses.combat?.critChance || 0);
      
      const healedDamageResult = calculateStatBasedDamage(
        healedStats,
        powerBonus,
        healedItemDamageMult,
        healedItemCritChance
      );
      const healedNewEnemyHp = Math.max(0, healedSession.enemyHp - healedDamageResult.damage);
      
      // Apply onCrit effects if crit occurred (v0.26.8)
      let healedLifeStealHp = 0;
      if (healedDamageResult.isCrit) {
        const healedCritMods = await applyItemEffects(userId, 'onCrit', { heroHp: 0 });
        if (healedCritMods.heroHp && healedCritMods.heroHp > 0) {
          healedLifeStealHp += Math.floor(healedCritMods.heroHp);
        }
      }
      
      const healedUpdatedSession = await prisma.combatSession.update({
        where: { id: healedSession.id },
        data: {
          enemyHp: healedNewEnemyHp,
          xpGained: { increment: XP_PER_HIT },
          goldGained: { increment: GOLD_PER_HIT },
          lastActionAt: new Date(),
        },
      });

      const healedCombatLog: CombatLogEntry[] = [
        ...restResult.combatLog,
        {
          type: 'attack',
          damage: healedDamageResult.damage,
          isCrit: healedDamageResult.isCrit,
          message: `⚔️  You hit ${healedSession.enemyName} for ${healedDamageResult.damage}${healedDamageResult.isCrit ? ' (crit!)' : ''}.`,
          timestamp: new Date(),
        },
      ];
      
      // Add heal message if item effect healed (v0.26.8)
      if (healedLifeStealHp > 0) {
        healedCombatLog.push({
          type: 'heal',
          message: `💖 Healed +${healedLifeStealHp} HP from item effect`,
          timestamp: new Date(),
        });
      }

      if (healedNewEnemyHp === 0) {
        return handleKill(userId, healedUpdatedSession, powerBonus);
      }

      return {
        session: formatSession(healedUpdatedSession),
        combatLog: healedCombatLog,
      };
    }

    // Check if enemy is already dead
    if (session.enemyHp <= 0) {
      return {
        session: formatSession(session),
        combatLog: [{
          type: 'respawn',
          message: '⏳ Shadow is respawning...',
          timestamp: new Date(),
        }],
      };
    }

    // Get user archetype and stats (v0.26.10)
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        archetypeKey: true,
        stats: true,
      },
    });
    
    const archetype = userData?.archetypeKey ? getArchetype(userData.archetypeKey) : null;
    const stats = (userData?.stats || {}) as UserStats;
    
    // Apply item effects for attack (v0.26.8)
    const itemAttackMods = await applyItemEffects(userId, 'onAttack', {
      damageMult: 1,
      critChance: 0,
    });
    
    // Apply life steal if present (v0.26.5)
    let lifeStealHp = 0;
    // Heal component is not part of onAttack by default; handled by onCrit
    if (itemAttackMods.heroHp) {
      lifeStealHp += Math.floor(itemAttackMods.heroHp);
    }
    
    // Calculate stat-based damage (v0.26.10)
    const itemDamageMult = (itemAttackMods.damageMult || 1.0) * (archetype?.bonuses.combat?.damageMult || 1.0);
    const itemCritChance = (itemAttackMods.critChance || 0) + (archetype?.bonuses.combat?.critChance || 0);
    
    const damageResult = calculateStatBasedDamage(
      stats,
      powerBonus,
      itemDamageMult,
      itemCritChance
    );
    
    // On crit, trigger onCrit effects (v0.26.8)
    if (damageResult.isCrit) {
      const critMods = await applyItemEffects(userId, 'onCrit', { heroHp: 0 });
      if (critMods.heroHp && critMods.heroHp > 0) {
        lifeStealHp += Math.floor(critMods.heroHp);
      }
    }
    const newEnemyHp = Math.max(0, session.enemyHp - damageResult.damage);

    // Apply life steal to hero HP if present (v0.26.5)
    const currentHeroHp = session.heroHp;
    const newHeroHpAfterLifeSteal = Math.min(
      session.heroMaxHp,
      currentHeroHp + lifeStealHp
    );
    
    // Update session
    const updatedSession = await prisma.combatSession.update({
      where: { id: session.id },
      data: {
        enemyHp: newEnemyHp,
        heroHp: lifeStealHp > 0 ? newHeroHpAfterLifeSteal : undefined, // Only update if life steal
        xpGained: { increment: XP_PER_HIT },
        goldGained: { increment: GOLD_PER_HIT },
        lastActionAt: new Date(),
      },
    });

    const combatLog: CombatLogEntry[] = [{
      type: 'attack',
      damage: damageResult.damage,
      isCrit: damageResult.isCrit,
      message: `⚔️  You hit ${session.enemyName} for ${damageResult.damage}${damageResult.isCrit ? ' (crit!)' : ''}.`,
      timestamp: new Date(),
    }];
    if (lifeStealHp > 0) {
      combatLog.push({
        type: 'heal',
        message: `💖 Healed +${lifeStealHp} HP from item effect`,
        timestamp: new Date(),
      });
    }

    // Check if enemy is killed
    if (newEnemyHp === 0) {
      return handleKill(userId, updatedSession, powerBonus);
    }

    return {
      session: formatSession(updatedSession),
      combatLog,
    };
  } catch (error) {
    logger.error('[CombatService] Error in attack', error);
    throw error;
  }
}

export async function enemyAttack(userId: string): Promise<CombatResult> {
  try {
    const session = await getActiveSession(userId);
    if (!session) {
      return getOrCreateSession(userId);
    }

    // Check if hero is resting - auto-heal first
    if (session.heroHp <= 0) {
      const restResult = await checkAndHealFromRest(userId, session);
      if (restResult.state === 'resting') {
        return restResult; // Still resting
      }
      // Fully healed, can continue attacking
      const healedSession = await getActiveSession(userId);
      if (!healedSession || healedSession.heroHp <= 0) {
        return restResult; // Fallback
      }
      // Continue with attack logic below using healed session
    }

    const activeSession = await getActiveSession(userId);
    if (!activeSession) {
      return getOrCreateSession(userId);
    }

    // Check if enemy is dead
    if (activeSession.enemyHp <= 0) {
      return {
        session: formatSession(activeSession),
        combatLog: [{
          type: 'respawn',
          message: '⏳ Shadow is defeated. Cannot attack.',
          timestamp: new Date(),
        }],
      };
    }

    // Get user stats for dodge check (v0.26.10)
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stats: true,
      },
    });
    
    const stats = (userData?.stats || {}) as UserStats;
    
    // Check for dodge using DEX stat (v0.26.10)
    const dodgeResult = checkDodge(stats.dex || 0);
    
    if (dodgeResult.dodged) {
      // Dodge successful - no damage taken
      const combatLog: CombatLogEntry[] = [{
        type: 'enemyHit',
        damage: 0,
        message: dodgeResult.message || '💨 You dodged!',
        timestamp: new Date(),
      }];
      
      return {
        session: formatSession(activeSession),
        combatLog,
      };
    }

    // Calculate enemy damage (dodge failed)
    const damage = Math.floor(Math.random() * (ENEMY_BASE_MAX - ENEMY_BASE_MIN + 1)) + ENEMY_BASE_MIN;
    const newHeroHp = Math.max(0, activeSession.heroHp - damage);

    // Update session
    const updatedSession = await prisma.combatSession.update({
      where: { id: activeSession.id },
      data: {
        heroHp: newHeroHp,
        lastActionAt: new Date(),
      },
    });

    const combatLog: CombatLogEntry[] = [{
      type: 'enemyHit',
      damage,
      message: `💢  ${activeSession.enemyName} retaliates for ${damage} damage.`,
      timestamp: new Date(),
    }];

    // Check for rest (replaces gameOver)
    if (newHeroHp === 0) {
      combatLog.push({
        type: 'rest',
        message: '🔥 You collapsed near the fire to rest...',
        timestamp: new Date(),
      });

      return {
        session: formatSession(updatedSession),
        combatLog,
        state: 'resting',
      };
    }

    return {
      session: formatSession(updatedSession),
      combatLog,
    };
  } catch (error) {
    logger.error('[CombatService] Error in enemyAttack', error);
    throw error;
  }
}

// ========================================
// REWARDS & CLEANUP
// ========================================

export async function handleKill(userId: string, session: any, powerBonus: number = 0): Promise<CombatResult> {
  try {
    const newKills = session.kills + 1;
    const newStreak = session.currentStreak + 1;

    // Check if killed enemy was a boss
    const wasBosskill = session.enemyName.startsWith('👑');
    
    // Calculate rewards using centralized reward service (v0.26.1)
    let rewardResult = calculateCombatKillReward(newStreak, powerBonus, wasBosskill);
    
    // Apply item effect bonuses to rewards (v0.26.8)
    const killMods = await applyItemEffects(userId, 'onKill', { xpMult: 1, goldMult: 1 });
    const xpMult = killMods.xpMult ?? 1;
    const goldMult = killMods.goldMult ?? 1;
    
    // Log effect application if any bonuses applied
    if (xpMult > 1 || goldMult > 1) {
      logger.debug('[ItemEffect] Applied onKill bonuses', {
        userId,
        xpMult,
        goldMult,
        baseXp: rewardResult.xp,
        baseGold: rewardResult.gold,
      });
    }
    
    rewardResult = {
      ...rewardResult,
      xp: Math.floor(rewardResult.xp * xpMult),
      gold: Math.floor(rewardResult.gold * goldMult),
    };
    
    const xpReward = rewardResult.xp;
    const goldReward = rewardResult.gold;
    const multiplier = rewardResult.multiplier;

    // Get user archetype and stats for bonuses (v0.26.10)
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        archetypeKey: true,
        stats: true,
      },
    });
    
    const archetype = userData?.archetypeKey ? getArchetype(userData.archetypeKey) : null;
    const stats = (userData?.stats || {}) as UserStats;
    
    // Apply stat-based bonuses (v0.26.10)
    const intBonus = calculateXPBonus(stats.int || 0);
    const chaBonus = calculateGoldBonus(stats.cha || 0);
    
    // Apply archetype combat bonuses (v0.26.6)
    let finalXpReward = xpReward;
    let finalGoldReward = goldReward;
    
    // Apply INT bonus to XP (v0.26.10)
    finalXpReward = Math.floor(finalXpReward * intBonus);
    
    // Apply CHA bonus to gold (v0.26.10)
    finalGoldReward = Math.floor(finalGoldReward * chaBonus);
    
    // Apply archetype bonuses on top of stat bonuses
    if (archetype?.bonuses.xp?.generalBonus) {
      finalXpReward = Math.floor(finalXpReward * (1 + archetype.bonuses.xp.generalBonus));
    }
    if (archetype?.bonuses.passive?.goldBonus) {
      finalGoldReward = Math.floor(finalGoldReward * (1 + archetype.bonuses.passive.goldBonus));
    }

    // Update user stats (XP now handled by progressionService)
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        funds: { increment: session.goldGained + finalGoldReward },
        combatKills: { increment: 1 },
        combatBattles: { increment: 1 },
        combatHighestStreak: {
          set: Math.max(session.currentStreak + 1, 0), // Will be compared with existing
        },
      },
      select: {
        xp: true,
        level: true,
        combatHighestStreak: true,
      },
    });
    
    // Add XP via progression service (v0.26.6)
    const xpResult = await addXP(userId, session.xpGained + finalXpReward, 'combat-kill');

    // Check if user's new streak is higher
    if (newStreak > user.combatHighestStreak) {
      await prisma.user.update({
        where: { id: userId },
        data: { combatHighestStreak: newStreak },
      });
    }

    // Spawn new enemy (check if next one should be boss)
    const newEnemyName = generateEnemyName(newKills);
    const isBoss = newEnemyName.startsWith('👑');
    const enemyHp = isBoss ? Math.floor(ENEMY_BASE_HP * BOSS_HP_MULTIPLIER) : ENEMY_BASE_HP;
    
    const updatedSession = await prisma.combatSession.update({
      where: { id: session.id },
      data: {
        enemyHp,
        enemyMaxHp: enemyHp,
        enemyName: newEnemyName,
        enemyType: isBoss ? 'boss' : 'shadow',
        xpGained: 0,
        goldGained: 0,
        kills: newKills,
        currentStreak: newStreak,
        lastActionAt: new Date(),
      },
    });

    // Build reward message with multiplier if > 1.0
    const multiplierText = multiplier > 1.0 ? ` (x${multiplier.toFixed(2)} bonus)` : '';
    const killMessage = `💀 ${session.enemyName} defeated!${wasBosskill ? ' 🏆 BOSS KILL!' : ''} 💫 +${xpReward} XP, 🪙 +${goldReward} gold${multiplierText}. (${newKills} kills, ${newStreak} streak)`;
    
    const combatLog: CombatLogEntry[] = [
      {
        type: 'kill',
        message: killMessage,
        timestamp: new Date(),
      },
      {
        type: 'respawn',
        message: isBoss ? `⚠️ ${newEnemyName} appears! (BOSS - ${enemyHp} HP)` : `🌑 ${newEnemyName} emerges...`,
        timestamp: new Date(),
      },
    ];

    // Check for level up (v0.26.6 - handled by progressionService)
    let levelUp: LevelUpResult | undefined;
    if (xpResult.leveledUp && xpResult.newLevel) {
      levelUp = {
        newLevel: xpResult.newLevel,
        oldLevel: user.level,
        xpNeeded: xpResult.level,
      };
      combatLog.push({
        type: 'respawn',
        message: `🔼 Level Up! You are now Level ${xpResult.newLevel}!`,
        timestamp: new Date(),
      });
    }

    logger.info(`[CombatService] User ${userId} killed ${session.enemyName}. Streak: ${newStreak}`);

    // Achievement unlocks (non-blocking)
    try {
      // First kill
      if (newKills === 1) {
        await unlockAchievement(userId, 'first-blood');
      }
      
      // Kill milestones
      if (newKills === 10) {
        await unlockAchievement(userId, 'combat-veteran', 1);
      } else if (newKills === 50) {
        await unlockAchievement(userId, 'combat-veteran', 2);
      } else if (newKills === 100) {
        await unlockAchievement(userId, 'combat-veteran', 3);
      }
      
      // Boss kill
      if (wasBosskill) {
        await unlockAchievement(userId, 'boss-breaker');
      }
      
      // Streak milestones
      if (newStreak === 10) {
        await unlockAchievement(userId, 'unstoppable', 1);
      } else if (newStreak === 25) {
        await unlockAchievement(userId, 'unstoppable', 2);
      } else if (newStreak === 50) {
        await unlockAchievement(userId, 'unstoppable', 3);
      }
    } catch (achievementError) {
      // Log but don't fail the kill operation
      logger.warn('[CombatService] Achievement unlock failed', achievementError);
    }

    // Item drop chance (v0.26.5)
    let droppedItem: { name: string; rarity: string; power: number } | null = null;
    try {
      const rand = Math.random();
      let dropRarity: string | null = null;
      
      if (rand < RewardConfig.drops.alpha) {
        dropRarity = 'alpha';
      } else if (rand < RewardConfig.drops.legendary) {
        dropRarity = 'legendary';
      } else if (rand < RewardConfig.drops.epic) {
        dropRarity = 'epic';
      } else if (rand < RewardConfig.drops.rare) {
        dropRarity = 'rare';
      }
      
      if (dropRarity) {
        // Find a base Item to use (can be a placeholder item)
        const baseItem = await prisma.item.findFirst({
          where: { isShopItem: false },
        });
        
        if (baseItem) {
          const itemData = await generateItem(dropRarity as any);
          const invItem = await createInventoryItem(userId, baseItem.id, itemData);
          
          // Get item name for toast
          const rarityNames: Record<string, string> = {
            rare: 'Rare',
            epic: 'Epic',
            legendary: 'Legendary',
            alpha: 'Alpha',
          };
          
          droppedItem = {
            name: `${rarityNames[dropRarity] || dropRarity} ${baseItem.name}`,
            rarity: dropRarity,
            power: itemData.power,
          };
          
          combatLog.push({
            type: 'kill',
            message: `🎁 Found ${droppedItem.name} (+${itemData.power} Power)!`,
            timestamp: new Date(),
          });
        }
      }
    } catch (dropError) {
      // Log but don't fail the kill operation
      logger.warn('[CombatService] Item drop failed', dropError);
    }

    return {
      session: formatSession(updatedSession),
      combatLog,
      rewards: {
        xp: xpReward,
        gold: goldReward,
        killBonus: true,
        multiplier, // Include multiplier for UI display (v0.26.1)
        droppedItem, // v0.26.5 - Item drop info for UI toast
      },
      levelUp,
    };
  } catch (error) {
    logger.error('[CombatService] Error in handleKill', error);
    throw error;
  }
}

export async function forfeit(userId: string): Promise<CombatResult> {
  try {
    const session = await getActiveSession(userId);
    if (!session) {
      return getOrCreateSession(userId);
    }

    // Mark session inactive (soft delete)
    await prisma.combatSession.update({
      where: { id: session.id },
      data: { isActive: false },
    });

    // Get user stats for VIT-based HP (v0.26.10)
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        archetypeKey: true,
        stats: true,
      },
    });
    
    let heroHp = HERO_BASE_HP;
    const stats = (userData?.stats || {}) as UserStats;
    
    // Calculate HP from VIT stat (v0.26.10)
    heroHp = calculateMaxHP(HERO_BASE_HP, stats.vit || 0);
    
    // Apply archetype HP multiplier if present
    if (userData?.archetypeKey) {
      const archetype = getArchetype(userData.archetypeKey);
      if (archetype?.bonuses.combat?.hpMult) {
        heroHp = Math.floor(heroHp * archetype.bonuses.combat.hpMult);
      }
    }
    
    // Create fresh session
    const newSession = await prisma.combatSession.create({
      data: {
        userId,
        heroHp,
        heroMaxHp: heroHp,
        enemyHp: ENEMY_BASE_HP,
        enemyMaxHp: ENEMY_BASE_HP,
        enemyName: generateEnemyName(0), // Reset to regular shadow
        enemyType: 'shadow',
      },
    });

    logger.info(`[CombatService] User ${userId} forfeited. New session created.`);

    return {
      session: formatSession(newSession),
      combatLog: [{
        type: 'respawn',
        message: '🔄 You forfeited. Starting fresh with full HP!',
        timestamp: new Date(),
      }],
    };
  } catch (error) {
    logger.error('[CombatService] Error in forfeit', error);
    throw error;
  }
}

// ========================================
// REST & HEALING
// ========================================

/**
 * Check rest state and auto-heal hero based on time elapsed
 * Returns CombatResult with updated HP or same state if still resting
 */
export async function checkAndHealFromRest(userId: string, session: any): Promise<CombatResult> {
  if (session.heroHp > 0) {
    return {
      session: formatSession(session),
      combatLog: [],
      state: 'active',
    };
  }

  const now = new Date();
  const restStarted = session.lastActionAt || session.createdAt;
  const restStartTime = restStarted instanceof Date ? restStarted : new Date(restStarted);
  const secondsResting = Math.floor((now.getTime() - restStartTime.getTime()) / 1000);

  // Full heal after REST_FULL_HEAL_SECONDS
  if (secondsResting >= REST_FULL_HEAL_SECONDS) {
    const updatedSession = await prisma.combatSession.update({
      where: { id: session.id },
      data: {
        heroHp: session.heroMaxHp,
        lastActionAt: now,
      },
    });

    return {
      session: formatSession(updatedSession),
      combatLog: [{
        type: 'heal',
        message: '🪶 You feel ready again. The fire restored your strength.',
        timestamp: now,
      }],
      state: 'active',
    };
  }

  // Get user stats for VIT-based healing (v0.26.10)
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stats: true,
    },
  });
  
  const stats = (userData?.stats || {}) as UserStats;
  const vit = stats.vit || 0;
  
  // Incremental heal: base + VIT bonus (v0.26.10)
  const baseHealPerSecond = calculateRestHeal(REST_HEAL_RATE, vit);
  let healAmount = Math.floor(secondsResting * baseHealPerSecond);
  
  // Apply onRest item effects (v0.26.8)
  const restMods = await applyItemEffects(userId, 'onRest', { heroHp: 0 });
  if (restMods.heroHp && restMods.heroHp > 0) {
    healAmount += Math.floor(restMods.heroHp);
  }
  
  const newHp = Math.min(session.heroMaxHp, healAmount);

  if (newHp > 0) {
    const updatedSession = await prisma.combatSession.update({
      where: { id: session.id },
      data: {
        heroHp: newHp,
        lastActionAt: now,
      },
    });

    const combatLog: CombatLogEntry[] = [];
    if (healAmount >= session.heroMaxHp) {
      combatLog.push({
        type: 'heal',
        message: '🪶 You feel ready again. The fire restored your strength.',
        timestamp: now,
      });
      return {
        session: formatSession(updatedSession),
        combatLog,
        state: 'active',
      };
    }

    const healMessage = restMods.heroHp && restMods.heroHp > 0
      ? `🔥 Resting... Slowly recovering (+${newHp} HP). Item effect: +${restMods.heroHp} HP.`
      : `🔥 Resting... Slowly recovering (+${newHp} HP).`;
    
    return {
      session: formatSession(updatedSession),
      combatLog: [{
        type: 'heal',
        message: healMessage,
        timestamp: now,
      }],
      state: 'resting',
    };
  }

  // Still at 0 HP, continue resting
  return {
    session: formatSession(session),
    combatLog: [],
    state: 'resting',
  };
}

// ========================================
// UTILITIES
// ========================================

export function calculateDamage(
  baseMin: number,
  baseMax: number,
  powerBonus: number = 0,
  effects?: { damageMult?: number; critChance?: number } // v0.26.5
): DamageResult {
  const baseDamage = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
  
  // Apply item effects to crit chance
  const effectiveCritChance = (effects?.critChance || 0) + CRIT_CHANCE;
  const isCrit = Math.random() < effectiveCritChance;
  const critBonus = isCrit ? Math.floor(baseDamage * (CRIT_MULTIPLIER - 1)) : 0;
  const powerBonusDamage = Math.floor(baseDamage * (powerBonus / 100));
  
  // Apply damage multiplier from item effects (v0.26.5)
  const damageMultiplier = effects?.damageMult || 1.0;
  const total = Math.floor((baseDamage + critBonus + powerBonusDamage) * damageMultiplier);

  return { damage: baseDamage, isCrit, total };
}

export function generateEnemyName(killCount: number = 0): string {
  // Check if next kill will be a boss fight (every BOSS_INTERVAL kills)
  const isBossFight = (killCount + 1) % BOSS_INTERVAL === 0;
  
  if (isBossFight) {
    return BOSS_NAMES[Math.floor(Math.random() * BOSS_NAMES.length)];
  }
  
  return SHADOW_NAMES[Math.floor(Math.random() * SHADOW_NAMES.length)];
}

function formatSession(session: any) {
  return {
    id: session.id,
    heroHp: session.heroHp,
    heroMaxHp: session.heroMaxHp,
    enemyHp: session.enemyHp,
    enemyMaxHp: session.enemyMaxHp,
    enemyName: session.enemyName,
    enemyType: session.enemyType,
    xpGained: session.xpGained,
    goldGained: session.goldGained,
    kills: session.kills,
    currentStreak: session.currentStreak,
  };
}

// ========================================
// INVENTORY INTEGRATION
// ========================================

export async function getPowerBonus(userId: string): Promise<number> {
  try {
    // Use itemService for power calculation with rarity multipliers (v0.26.5)
    return await getTotalItemPower(userId);
  } catch (error) {
    logger.warn('[CombatService] Error getting power bonus, returning 0', error);
    return 0;
  }
}

