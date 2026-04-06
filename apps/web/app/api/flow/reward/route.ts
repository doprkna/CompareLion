/**
 * POST /api/flow/reward
 * Post-flow completion reward roll + DB log (+ apply coins/xp/diamonds to user).
 * v0.48.01
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { generateFlowReward } from '@parel/core';
import { safeAsync, authError, notFoundError } from '@/lib/api-handler';

export const runtime = 'nodejs';

export const POST = safeAsync(async (_req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  const reward = generateFlowReward();

  await prisma.$transaction(async (tx) => {
    await tx.flowRewardLog.create({
      data: {
        userId: user.id,
        type: reward.type,
        amount: reward.amount,
        rarity: reward.rarity,
      },
    });

    if (reward.type === 'coins') {
      await tx.user.update({
        where: { id: user.id },
        data: { coins: { increment: reward.amount } },
      });
    } else if (reward.type === 'xp') {
      await tx.user.update({
        where: { id: user.id },
        data: { xp: { increment: reward.amount } },
      });
    } else {
      await tx.user.update({
        where: { id: user.id },
        data: { diamonds: { increment: reward.amount } },
      });
    }
  });

  return NextResponse.json({ success: true, reward });
});
