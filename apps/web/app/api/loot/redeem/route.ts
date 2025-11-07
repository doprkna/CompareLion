import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const RedeemSchema = z.object({
  lootId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = RedeemSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Find user loot moment
  const userLoot = await prisma.userLootMoment.findUnique({
    where: { id: parsed.data.lootId },
    include: { moment: true },
  });

  if (!userLoot) return notFoundError('Loot moment not found');
  if (userLoot.userId !== user.id) return unauthorizedError('Not authorized');

  // Check if already redeemed
  if (userLoot.redeemedAt) {
    return validationError('Loot already redeemed');
  }

  const rewardData = userLoot.rewardData as any;

  // Grant rewards based on type
  await prisma.$transaction(async (tx) => {
    if (rewardData.type === 'xp') {
      await tx.user.update({
        where: { id: user.id },
        data: { xp: { increment: rewardData.value } },
      });
    } else if (rewardData.type === 'gold') {
      await tx.user.update({
        where: { id: user.id },
        data: { funds: { increment: rewardData.value } },
      });
    }
    // For item/cosmetic/emote, would need to create inventory entries
    // Placeholder for future implementation

    // Mark as redeemed
    await tx.userLootMoment.update({
      where: { id: userLoot.id },
      data: { redeemedAt: new Date() },
    });

    // Log action
    await tx.actionLog.create({
      data: {
        userId: user.id,
        action: 'loot_moment_redeemed',
        metadata: {
          lootId: userLoot.id,
          rewardType: rewardData.type,
          rewardValue: rewardData.value,
          rarity: rewardData.rarity,
        } as any,
      },
    }).catch(() => {});
  });

  return NextResponse.json({
    success: true,
    redeemed: true,
    reward: {
      type: rewardData.type,
      value: rewardData.value,
      rarity: rewardData.rarity,
    },
  });
});

