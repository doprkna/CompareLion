import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const rarities = await prisma.rarityTier.findMany({
    where: { isActive: true },
    orderBy: { rankOrder: 'asc' },
    select: {
      id: true,
      key: true,
      name: true,
      colorPrimary: true,
      colorGlow: true,
      frameStyle: true,
      rankOrder: true,
      description: true,
    },
  });

  return NextResponse.json({
    success: true,
    rarities,
  });
});

