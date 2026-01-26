/**
 * Social Following API
 * GET /api/social/following - List users that current user is following
 * v0.37.3 - Follow User Feature
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getFollowing } from '@/lib/social/followService';

export const runtime = 'nodejs';

/**
 * GET /api/social/following
 * Returns list of users that the current user is following
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get following IDs
  const followingIds = await getFollowing(user.id);

  if (followingIds.length === 0) {
    return successResponse({
      following: [],
      totalFollowing: 0,
    });
  }

  // Get user details for following users
  const followingUsers = await prisma.user.findMany({
    where: {
      id: { in: followingIds },
    },
    select: {
      id: true,
      username: true,
      name: true,
      level: true,
      archetype: true,
    },
  });

  return successResponse({
    following: followingUsers.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      level: u.level || 1,
      archetype: u.archetype,
    })),
    totalFollowing: followingUsers.length,
  });
});

