import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';

/**
 * GET /api/creator/packs
 * List approved content for creators
 * Public endpoint (approved packs only)
 * v0.29.19 - Ops & Community Tools
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'poll' | 'reflection' | 'mission' | null
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Build where clause - only approved packs
  const where: any = {
    status: 'APPROVED',
  };
  if (type) {
    where.type = type.toUpperCase();
  }

  // Get approved packs
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
      orderBy: { createdAt: 'desc' },
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
      createdAt: p.createdAt,
      approvedAt: p.approvedAt,
    })),
    total,
    limit,
    offset,
  });
});

