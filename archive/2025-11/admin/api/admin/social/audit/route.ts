/**
 * Admin Social Audit API
 * GET /api/admin/social/audit - List all social relationships (follows, blocks)
 * v0.36.42 - Social Systems 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

/**
 * GET /api/admin/social/audit
 * List all social relationships for moderation
 */
export const GET = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || undefined;
  const relationshipType = searchParams.get('type') || undefined; // 'follow' | 'block'

  // Get follows
  let follows: any[] = [];
  if (!relationshipType || relationshipType === 'follow') {
    const followWhere: any = {};
    if (userId) {
      followWhere.OR = [
        { followerId: userId },
        { targetId: userId },
      ];
    }

    follows = await prisma.follow.findMany({
      where: followWhere,
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
        target: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // Get blocks
  let blocks: any[] = [];
  if (!relationshipType || relationshipType === 'block') {
    const blockWhere: any = {};
    if (userId) {
      blockWhere.OR = [
        { userId },
        { blockedUserId: userId },
      ];
    }

    blocks = await prisma.block.findMany({
      where: blockWhere,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
        blockedUser: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  return successResponse({
    follows: follows.map(f => ({
      id: f.id,
      followerId: f.followerId,
      targetId: f.targetId,
      follower: f.follower,
      target: f.target,
      createdAt: f.createdAt.toISOString(),
    })),
    blocks: blocks.map(b => ({
      id: b.id,
      userId: b.userId,
      blockedUserId: b.blockedUserId,
      user: b.user,
      blockedUser: b.blockedUser,
      createdAt: b.createdAt.toISOString(),
    })),
    stats: {
      totalFollows: follows.length,
      totalBlocks: blocks.length,
    },
  });
});

