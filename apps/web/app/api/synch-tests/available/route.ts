import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const tests = await prisma.synchTest.findMany({
    where: { isActive: true },
    select: {
      id: true,
      key: true,
      title: true,
      description: true,
      rewardXP: true,
      rewardKarma: true,
      questions: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, tests });
});

