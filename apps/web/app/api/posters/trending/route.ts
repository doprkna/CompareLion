/**
 * Poster Trending API (v0.29.28)
 * 
 * GET /api/posters/trending
 * Optional public showcase of top shared designs
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const rarity = searchParams.get('rarity'); // 'gold' | 'silver' | 'bronze' | null

  // Build where clause - only shared posters
  const where: any = {
    isShared: true,
    imageUrl: { not: null }, // Must have image
  };

  // Optional rarity filter
  if (rarity) {
    where.statsJson = {
      path: ['rarity'],
      equals: rarity,
    };
  }

  // Get trending shared posters
  const posters = await (prisma as any).posterCard.findMany({
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
    orderBy: [
      { createdAt: 'desc' }, // Most recent shared
    ],
    take: limit,
    select: {
      id: true,
      title: true,
      statsJson: true,
      imageUrl: true,
      isShared: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Format response
  const formattedPosters = posters.map((poster: any) => ({
    id: poster.id,
    title: poster.title,
    statsJson: poster.statsJson,
    imageUrl: poster.imageUrl,
    isShared: poster.isShared,
    createdAt: poster.createdAt,
    creator: poster.user ? {
      id: poster.user.id,
      username: poster.user.username || poster.user.name || 'Anonymous',
      avatarUrl: poster.user.avatarUrl,
    } : null,
  }));

  return successResponse({
    posters: formattedPosters,
    count: formattedPosters.length,
    limit,
    rarity: rarity || 'all',
  });
});

