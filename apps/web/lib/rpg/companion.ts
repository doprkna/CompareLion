/**
 * Companion System
 * Passive buffs from pets and companions
 * v0.36.17 - Companions + Pets System v0.1
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface CompanionBonuses {
  atkBonus: number;
  defBonus: number;
  hpBonus: number;
  critBonus: number;
  speedBonus: number;
  xpBonus: number; // Percentage
  goldBonus: number; // Percentage
}

/**
 * Get equipped companion bonuses for user
 * Returns zero bonuses if no companion equipped
 * v0.36.32 - Updated to support new Pet/UserPet system
 */
export async function getEquippedCompanionBonuses(userId: string): Promise<CompanionBonuses> {
  try {
    // Check new Pet system first (v0.36.32)
    const userPet = await prisma.userPet.findFirst({
      where: {
        userId,
        equipped: true,
      },
      include: {
        pet: true,
      },
    });

    if (userPet && userPet.pet) {
      const bonus = (userPet.pet.bonus || {}) as any;
      return {
        atkBonus: bonus.attack || 0,
        defBonus: bonus.defense || 0,
        hpBonus: 0, // Pets don't grant HP bonus in MVP
        critBonus: bonus.critChance || 0,
        speedBonus: bonus.speed || 0,
        xpBonus: 0,
        goldBonus: 0,
      };
    }

    // Fall back to legacy UserCompanion system (backward compatibility)
    const userCompanion = await prisma.userCompanion.findFirst({
      where: {
        userId,
        equipped: true,
      },
      include: {
        companion: true,
      },
    });

    if (!userCompanion || !userCompanion.companion) {
      return {
        atkBonus: 0,
        defBonus: 0,
        hpBonus: 0,
        critBonus: 0,
        speedBonus: 0,
        xpBonus: 0,
        goldBonus: 0,
      };
    }

    const companion = userCompanion.companion;
    
    // Get base companion bonuses
    let atkBonus = companion.atkBonus || 0;
    let defBonus = companion.defBonus || 0;
    let hpBonus = companion.hpBonus || 0;
    let critBonus = companion.critBonus || 0;
    let speedBonus = companion.speedBonus || 0;
    let xpBonus = companion.xpBonus || 0;
    
    // Add level-up bonuses (v0.36.20 - Unified companion system)
    const levelUpBonuses = (userCompanion as any).levelUpBonuses;
    if (levelUpBonuses && typeof levelUpBonuses === 'object') {
      atkBonus += levelUpBonuses.atkBonus || 0;
      defBonus += levelUpBonuses.defBonus || 0;
      hpBonus += levelUpBonuses.hpBonus || 0;
      critBonus += levelUpBonuses.critBonus || 0;
      speedBonus += levelUpBonuses.speedBonus || 0;
      xpBonus += levelUpBonuses.xpBonus || 0;
    }
    
    return {
      atkBonus,
      defBonus,
      hpBonus,
      critBonus,
      speedBonus,
      xpBonus,
      goldBonus: companion.goldBonus || 0,
    };
  } catch (error) {
    logger.error('[Companion] Error getting equipped companion bonuses', error);
    return {
      atkBonus: 0,
      defBonus: 0,
      hpBonus: 0,
      critBonus: 0,
      speedBonus: 0,
      xpBonus: 0,
      goldBonus: 0,
    };
  }
}

/**
 * Equip a companion
 * Unequips any currently equipped companion automatically
 */
export async function equipCompanion(userId: string, userCompanionId: string): Promise<void> {
  try {
    // Verify ownership
    const userCompanion = await prisma.userCompanion.findUnique({
      where: { id: userCompanionId },
    });

    if (!userCompanion || userCompanion.userId !== userId) {
      throw new Error('Companion not found or not owned by user');
    }

    // Unequip all companions for this user
    await prisma.userCompanion.updateMany({
      where: {
        userId,
        equipped: true,
      },
      data: {
        equipped: false,
      },
    });

    // Equip the requested companion
    await prisma.userCompanion.update({
      where: { id: userCompanionId },
      data: {
        equipped: true,
      },
    });

    logger.info(`[Companion] User ${userId} equipped companion ${userCompanionId}`);
  } catch (error) {
    logger.error('[Companion] Error equipping companion', error);
    throw error;
  }
}

/**
 * Unequip companion
 */
export async function unequipCompanion(userId: string): Promise<void> {
  try {
    await prisma.userCompanion.updateMany({
      where: {
        userId,
        equipped: true,
      },
      data: {
        equipped: false,
      },
    });

    logger.info(`[Companion] User ${userId} unequipped companion`);
  } catch (error) {
    logger.error('[Companion] Error unequipping companion', error);
    throw error;
  }
}

/**
 * Grant XP to companion (20% of hero XP)
 * Handles leveling up automatically
 */
export async function grantCompanionXP(userId: string, heroXpGained: number): Promise<void> {
  try {
    const companionXp = Math.floor(heroXpGained * 0.2); // 20% of hero XP

    if (companionXp <= 0) {
      return; // No XP to grant
    }

    const userCompanion = await prisma.userCompanion.findFirst({
      where: {
        userId,
        equipped: true,
      },
      include: {
        companion: true,
      },
    });

    if (!userCompanion) {
      return; // No companion equipped
    }

    const currentLevel = userCompanion.level || 1;
    const currentXp = userCompanion.xp || 0;
    const newXp = currentXp + companionXp;
    const xpRequired = 100 * currentLevel;

    if (newXp >= xpRequired) {
      // Level up (v0.36.20 - Unified companion system)
      const newLevel = currentLevel + 1;
      const remainingXp = newXp - xpRequired;

      // Generate level-up bonuses
      // +1 random stat from: atkBonus, defBonus, hpBonus, critBonus, speedBonus
      const statOptions = ['atkBonus', 'defBonus', 'hpBonus', 'critBonus', 'speedBonus'];
      const randomStat = statOptions[Math.floor(Math.random() * statOptions.length)];
      
      // 5% chance: +1 xpBonus
      const shouldAddXpBonus = Math.random() < 0.05;
      
      // Get current level-up bonuses (stored in JSON field or separate fields)
      // For now, we'll store in a JSON field called levelUpBonuses
      const currentBonuses = (userCompanion as any).levelUpBonuses || {
        atkBonus: 0,
        defBonus: 0,
        hpBonus: 0,
        critBonus: 0,
        speedBonus: 0,
        xpBonus: 0,
      };
      
      // Add random stat bonus
      currentBonuses[randomStat] = (currentBonuses[randomStat] || 0) + 1;
      
      // 5% chance to add xpBonus
      if (shouldAddXpBonus) {
        currentBonuses.xpBonus = (currentBonuses.xpBonus || 0) + 1;
      }

      // Update user companion level and bonuses
      await prisma.userCompanion.update({
        where: { id: userCompanion.id },
        data: {
          level: newLevel,
          xp: remainingXp,
          // Store level-up bonuses in JSON field (requires schema update)
          // For now, using a workaround with Prisma's JSON support
          ...(typeof (prisma.userCompanion as any).fields?.levelUpBonuses !== 'undefined' 
            ? { levelUpBonuses: currentBonuses }
            : {}),
        },
      });

      logger.info(`[Companion] Companion ${userCompanion.id} leveled up to ${newLevel}`, {
        statBonus: randomStat,
        xpBonusAdded: shouldAddXpBonus,
        bonuses: currentBonuses,
      });
    } else {
      // Just add XP
      await prisma.userCompanion.update({
        where: { id: userCompanion.id },
        data: {
          xp: newXp,
        },
      });
    }
  } catch (error) {
    logger.error('[Companion] Error granting companion XP', error);
    // Don't throw - companion XP is optional
  }
}

