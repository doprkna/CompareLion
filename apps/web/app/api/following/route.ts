/**
 * GET /api/following - List users the current user follows
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError } from '@/lib/api-handler';

export async function GET(req: NextRequest) {
  const user = await getFlowUser(req);
  if (!user) return authError();

  const cursor = req.nextUrl.searchParams.get('cursor');
  const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10)));

  const follows = await prisma.userFollow.findMany({
    where: { followerId: user.id },
    include: {
      followed: {
        select: { id: true, name: true, username: true, image: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = follows.length > limit;
  const items = hasMore ? follows.slice(0, limit) : follows;

  return successResponse({
    items: items.map((f) => ({
      id: f.followed.id,
      name: f.followed.name || f.followed.username || 'User',
      avatar: f.followed.image || f.followed.avatarUrl,
    })),
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}
