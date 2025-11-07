import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const limit = Number(req.nextUrl.searchParams.get('limit') || '20');
  const type = req.nextUrl.searchParams.get('type');

  const creations = await prisma.communityCreation.findMany({
    where: {
      status: 'approved',
      ...(type ? { type: type as any } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          likes_rel: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: Math.max(1, Math.min(50, limit)),
  });

  return NextResponse.json({
    success: true,
    creations: creations.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      content: c.content,
      likes: c.likes,
      rewardXP: c.rewardXP,
      rewardKarma: c.rewardKarma,
      createdAt: c.createdAt,
      user: c.user,
      likesCount: c._count.likes_rel,
    })),
  });
});

