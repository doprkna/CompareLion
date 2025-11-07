/**
 * Creator Published Packs API (v0.29.27)
 * 
 * GET /api/creator/published
 * Returns visible community packs for others to use
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'POLL' | 'REFLECTION' | 'MISSION' | null
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const sort = searchParams.get('sort') || 'trending'; // 'trending' | 'newest' | 'popular'

  // Build where clause - only published and approved packs
  const where: any = {
    status: 'APPROVED',
    publishedAt: { not: null }, // Must be published
  };

  if (type) {
    where.type = type.toUpperCase();
  }

  // Build order by
  let orderBy: any = {};
  if (sort === 'newest') {
    orderBy = { publishedAt: 'desc' };
  } else if (sort === 'popular') {
    orderBy = { downloadsCount: 'desc' };
  } else {
    // Trending: combination of downloads and recency
    orderBy = [
      { downloadsCount: 'desc' },
      { publishedAt: 'desc' },
    ];
  }

  // Get published packs
  const [packs, total] = await Promise.all([
    prisma.creatorPack.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.creatorPack.count({ where }),
  ]);

  return successResponse({
    packs: packs.map((p) => ({
      id: p.id,
      creatorId: p.creatorId,
      creator: p.user ? {
        id: p.user.id,
        username: p.user.username,
        name: p.user.name,
        avatarUrl: p.user.avatarUrl,
      } : null,
      title: p.title,
      description: p.description,
      type: p.type,
      status: p.status,
      metadata: p.metadata,
      rewardType: p.rewardType,
      rewardValue: p.rewardValue,
      publishedAt: p.publishedAt,
      downloadsCount: p.downloadsCount || 0,
      createdAt: p.createdAt,
      approvedAt: p.approvedAt,
    })),
    total,
    limit,
    offset,
    sort,
  });
});

