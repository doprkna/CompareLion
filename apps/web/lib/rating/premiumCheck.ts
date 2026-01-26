/**
 * Premium Check Utilities
 * Check if user has premium access
 * v0.38.13 - Premium Deep Dive Analysis
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Check if user has premium access
 * 
 * @param userId - User ID
 * @returns True if user has premium, false otherwise
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumUntil: true,
      },
    });

    if (!user) {
      return false;
    }

    // Check if premium is active
    if (!user.isPremium) {
      return false;
    }

    // Check if premium expired
    if (user.premiumUntil && new Date(user.premiumUntil) < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('[PremiumCheck] Failed to check premium status', { userId, error });
    return false;
  }
}

