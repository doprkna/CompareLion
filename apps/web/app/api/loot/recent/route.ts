import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '5');

  // Get recent loot moments
  const recentLoot = await prisma.userLootMoment.findMany({
    where: { userId: user.id },
    include: { moment: true },
    orderBy: { triggeredAt: 'desc' },
    take: limit,
  });

  const formatted = recentLoot.map((loot) => {
    const rewardData = loot.rewardData as any;
    return {
      id: loot.id,
      rarity: loot.moment.rarity,
      rewardType: rewardData.type,
      rewardValue: rewardData.value,
      flavorText: rewardData.flavorText || loot.moment.flavorText,
      triggeredAt: loot.triggeredAt,
      redeemedAt: loot.redeemedAt,
      isRedeemed: !!loot.redeemedAt,
    };
  });

  return NextResponse.json({
    success: true,
    loot: formatted,
  });
});

