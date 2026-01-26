/**
 * Mission Reward Service
 * Handles claiming and granting rewards for completed missions
 * v0.36.36 - Missions & Quests 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { MissionReward } from './types';

/**
 * Claim mission reward
 * Grants rewards to user and marks mission as claimed
 * 
 * @param userId - User ID
 * @param missionProgressId - MissionProgress record ID
 * @returns Success status and granted rewards
 */
export async function claimMissionReward(
  userId: string,
  missionProgressId: string
): Promise<{ success: boolean; rewards?: MissionReward; error?: string }> {
  try {
    // TODO: Implement once MissionProgress model exists:
    // 1. Find MissionProgress record (verify userId matches)
    // 2. Check if mission is completed and not already claimed
    // 3. Get Mission record to access reward structure
    // 4. Grant rewards in transaction:
    //    - XP: increment user.xp
    //    - Gold: increment user.funds
    //    - Diamonds: increment user.diamonds (if field exists)
    //    - Battlepass XP: call addBattlePassXP()
    //    - Items: call addItemToInventory() for each item
    // 5. Mark MissionProgress as claimed
    // 6. Return success and granted rewards

    logger.info(`[MissionReward] Claiming reward`, {
      userId,
      missionProgressId,
    });

    return {
      success: false,
      error: 'Not implemented - MissionProgress model required',
    };

  } catch (error) {
    logger.error('[MissionReward] Failed to claim reward', {
      userId,
      missionProgressId,
      error,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Grant mission reward to user
 * Internal helper that actually applies rewards
 * 
 * @param userId - User ID
 * @param reward - Reward structure to grant
 */
export async function grantReward(userId: string, reward: MissionReward): Promise<void> {
  try {
    // Grant XP
    if (reward.xp && reward.xp > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: reward.xp } },
      });
    }

    // Grant Gold
    if (reward.gold && reward.gold > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { funds: { increment: reward.gold } },
      });
    }

    // Grant Diamonds (if field exists)
    if (reward.diamonds && reward.diamonds > 0) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { diamonds: { increment: reward.diamonds } } as any,
        });
      } catch (error) {
        logger.debug('[MissionReward] Diamonds field may not exist', error);
      }
    }

    // Grant Battlepass XP
    if (reward.battlepassXP && reward.battlepassXP > 0) {
      try {
        const { addBattlePassXP } = await import('@/lib/services/battlepassService');
        await addBattlePassXP(userId, reward.battlepassXP);
      } catch (error) {
        logger.debug('[MissionReward] Battlepass service not available', error);
      }
    }

    // Grant Items
    if (reward.items && reward.items.length > 0) {
      try {
        const { addItemToInventory } = await import('@/lib/services/itemService');
        for (const itemReward of reward.items) {
          await addItemToInventory(userId, itemReward.itemId, itemReward.quantity);
        }
      } catch (error) {
        logger.error('[MissionReward] Failed to grant items', error);
      }
    }

    logger.info('[MissionReward] Rewards granted', {
      userId,
      reward,
    });

  } catch (error) {
    logger.error('[MissionReward] Failed to grant reward', {
      userId,
      reward,
      error,
    });
    throw error;
  }
}

