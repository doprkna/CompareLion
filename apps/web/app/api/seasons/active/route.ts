import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

export const GET = safeAsync(async (_req: NextRequest) => {
  const season = await prisma.seasonStoryline.findFirst({
    where: { isActive: true },
    include: { achievements: true },
    orderBy: { startDate: 'desc' },
  });
  if (!season) return NextResponse.json({ success: true, season: null });
  return NextResponse.json({
    success: true,
    season: {
      id: season.id,
      key: season.key,
      title: season.title,
      description: season.description,
      startDate: season.startDate,
      endDate: season.endDate,
      xpBonus: season.xpBonus,
      goldBonus: season.goldBonus,
      eventModifier: season.eventModifier,
      themeColor: season.themeColor,
      posterUrl: season.posterUrl,
      achievements: season.achievements,
    },
  });
});






