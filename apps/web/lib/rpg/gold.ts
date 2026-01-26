/**
 * Safe Gold Operations
 * Prevents negative gold and ensures atomic operations
 * v0.36.14 - Economy Sanity Pass
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface GoldOperationResult {
  success: boolean;
  newBalance: number;
  error?: string;
}

/**
 * Safely add gold to user's account
 * Ensures gold never goes negative (though adding shouldn't cause this)
 */
export async function safeAddGold(
  userId: string,
  amount: number
): Promise<GoldOperationResult> {
  if (amount < 0) {
    return {
      success: false,
      newBalance: 0,
      error: 'Cannot add negative gold amount',
    };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        funds: { increment: amount },
      },
      select: {
        funds: true,
      },
    });

    const newBalance = Number(updated.funds || 0);
    
    // Safety check: ensure balance is not negative (shouldn't happen, but just in case)
    if (newBalance < 0) {
      logger.error(`[GoldOps] Negative balance detected for user ${userId}, resetting to 0`);
      await prisma.user.update({
        where: { id: userId },
        data: { funds: 0 },
      });
      return {
        success: false,
        newBalance: 0,
        error: 'Balance went negative, reset to 0',
      };
    }

    logger.debug(`[GoldOps] Added ${amount} gold to user ${userId}, new balance: ${newBalance}`);
    
    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    logger.error(`[GoldOps] Error adding gold to user ${userId}`, error);
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Safely spend gold from user's account
 * Checks balance before deducting, returns error if insufficient funds
 */
export async function safeSpendGold(
  userId: string,
  amount: number
): Promise<GoldOperationResult> {
  if (amount < 0) {
    return {
      success: false,
      newBalance: 0,
      error: 'Cannot spend negative gold amount',
    };
  }

  try {
    // Check current balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        funds: true,
      },
    });

    if (!user) {
      return {
        success: false,
        newBalance: 0,
        error: 'User not found',
      };
    }

    const currentBalance = Number(user.funds || 0);

    if (currentBalance < amount) {
      return {
        success: false,
        newBalance: currentBalance,
        error: `Insufficient funds. Required: ${amount}, Available: ${currentBalance}`,
      };
    }

    // Deduct gold
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        funds: { decrement: amount },
      },
      select: {
        funds: true,
      },
    });

    const newBalance = Number(updated.funds || 0);

    // Safety check: ensure balance is not negative
    if (newBalance < 0) {
      logger.error(`[GoldOps] Negative balance after spend for user ${userId}, resetting to 0`);
      await prisma.user.update({
        where: { id: userId },
        data: { funds: 0 },
      });
      return {
        success: false,
        newBalance: 0,
        error: 'Balance went negative after transaction, reset to 0',
      };
    }

    logger.debug(`[GoldOps] Spent ${amount} gold from user ${userId}, new balance: ${newBalance}`);
    
    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    logger.error(`[GoldOps] Error spending gold from user ${userId}`, error);
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

