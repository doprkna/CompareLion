import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/items/discoveries
 * List discovered items for user
 * Auth required
 * v0.29.20 - Item Ecosystem Expansion
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Get user's discovered items
  const [discoveries, total] = await Promise.all([
    prisma.itemDiscovery.findMany({
      where: { userId: user.id },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            type: true,
            rarity: true,
            description: true,
            icon: true,
            emoji: true,
            category: true,
          },
        },
      },
      orderBy: { discoveredAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.itemDiscovery.count({ where: { userId: user.id } }),
  ]);

  return successResponse({
    discoveries: discoveries.map((d) => ({
      id: d.id,
      itemId: d.itemId,
      item: d.item,
      discoveredAt: d.discoveredAt,
    })),
    total,
    limit,
    offset,
  });
});

