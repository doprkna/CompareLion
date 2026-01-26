import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

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
  let autoRedeemed = 0;
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
    }).catch(() => {});

    autoRedeemed++;
  }

  return NextResponse.json({
    success: true,
    reset: true,
    autoRedeemed,
    totalOldLoot: oldLoot.length,
  });
});

