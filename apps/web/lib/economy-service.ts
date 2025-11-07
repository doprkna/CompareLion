/**
 * Economy Service
 * v0.18.0 - Handles XP/coins conversion and rewards
 */

import { prisma } from '@/lib/db';
import { xpToCoins, getCoinReward } from '@/config/economy';
import { logger } from '@/lib/logger';

export type RewardAction = 
  | 'questionAnswered'
  | 'correctAnswer'
  | 'dailyLogin'
  | 'streakBonus'
  | 'submissionApproved'
  | 'eventParticipation'
  | 'upvoteReceived';

/**
 * Award XP and automatically convert to coins
 */
export async function awardXP(
  userId: string,
  xpAmount: number,
  source?: string
): Promise<{ xp: number; coins: number; totalXP: number; totalCoins: number }> {
  try {
    // Calculate coins from XP
    const coinsEarned = xpToCoins(xpAmount);

    // Update user XP, coins, and seasonal XP
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpAmount },
        seasonalXP: { increment: xpAmount },
        coins: { increment: coinsEarned },
      },
      select: {
        xp: true,
        coins: true,
        seasonalXP: true,
      },
    });

    logger.info('[ECONOMY] User earned XP and coins', { userId, xpAmount, coinsEarned, source: source || 'unknown' });

    return {
      xp: xpAmount,
      coins: coinsEarned,
      totalXP: user.xp,
      totalCoins: user.coins,
    };
  } catch (error) {
    logger.error('[ECONOMY] Failed to award XP', error);
    throw error;
  }
}

/**
 * Award coins directly (for specific rewards)
 */
export async function awardCoins(
  userId: string,
  amount: number,
  source?: string
): Promise<{ coins: number; totalCoins: number }> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: amount },
      },
      select: {
        coins: true,
      },
    });

    logger.info('[ECONOMY] User earned coins', { userId, amount, source: source || 'unknown' });

    return {
      coins: amount,
      totalCoins: user.coins,
    };
  } catch (error) {
    logger.error('[ECONOMY] Failed to award coins', error);
    throw error;
  }
}

/**
 * Spend coins (for purchases)
 */
export async function spendCoins(
  userId: string,
  amount: number,
  itemName?: string
): Promise<{ success: boolean; remainingCoins: number; error?: string }> {
  try {
    // Check if user has enough coins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user) {
      return { success: false, remainingCoins: 0, error: 'User not found' };
    }

    if (user.coins < amount) {
      return { 
        success: false, 
        remainingCoins: user.coins, 
        error: `Insufficient coins. Need ${amount}, have ${user.coins}` 
      };
    }

    // Deduct coins
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { decrement: amount },
      },
      select: {
        coins: true,
      },
    });

    logger.info('[ECONOMY] User spent coins', { userId, amount, itemName: itemName || 'item' });

    return {
      success: true,
      remainingCoins: updatedUser.coins,
    };
  } catch (error) {
    logger.error('[ECONOMY] Failed to spend coins', error);
    return { success: false, remainingCoins: 0, error: 'Transaction failed' };
  }
}

/**
 * Get coin reward for a specific action
 */
export async function awardActionReward(
  userId: string,
  action: RewardAction
): Promise<{ coins: number; totalCoins: number }> {
  const coinAmount = getCoinReward(action);
  return await awardCoins(userId, coinAmount, action);
}

/**
 * Award combo: XP + action bonus
 */
export async function awardCombo(
  userId: string,
  xpAmount: number,
  action: RewardAction
): Promise<{ xp: number; coins: number; bonusCoins: number; totalCoins: number }> {
  // Award XP (which converts to coins)
  const xpReward = await awardXP(userId, xpAmount, action);
  
  // Award action-specific bonus
  const actionReward = await awardActionReward(userId, action);

  return {
    xp: xpReward.xp,
    coins: xpReward.coins,
    bonusCoins: actionReward.coins,
    totalCoins: actionReward.totalCoins,
  };
}

/**
 * Get user's current economy stats
 */
export async function getUserEconomyStats(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        coins: true,
        seasonalXP: true,
        diamonds: true,
        level: true,
        karmaScore: true,
      },
    });

    return user;
  } catch (error) {
    logger.error('[ECONOMY] Failed to get user stats', error);
    return null;
  }
}

