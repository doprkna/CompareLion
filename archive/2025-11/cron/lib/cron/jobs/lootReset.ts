/**
 * Loot Reset Job Handler (v0.29.21)
 * 
 * Reset daily loot cooldowns
 */

import { prisma } from '@/lib/db';

export async function runLootReset(): Promise<void> {
  // This cron job doesn't need to do anything special
  // Daily limits are checked by comparing triggeredAt dates
  // But we could clean up old unredeemed loot if needed

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find unredeemed loot older than 7 days
  const oldLoot = await prisma.userLootMoment.findMany({
    where: {
      redeemedAt: null,
      triggeredAt: { lt: sevenDaysAgo },
    },
  });

  // Auto-redeem old loot
  for (const loot of oldLoot) {
    const rewardData = loot.rewardData as any;

    await prisma.$transaction(async (tx) => {
      if (rewardData.type === 'xp') {
        await tx.user.update({
          where: { id: loot.userId },
          data: { xp: { increment: rewardData.value } },
        });
      } else if (rewardData.type === 'gold') {
        await tx.user.update({
          where: { id: loot.userId },
          data: { funds: { increment: rewardData.value } },
        });
      }

      await tx.userLootMoment.update({
        where: { id: loot.id },
        data: { redeemedAt: new Date() },
      });
    }).catch(() => {
      // Ignore errors for individual loot items
    });
  }
}

