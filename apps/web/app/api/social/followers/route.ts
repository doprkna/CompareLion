/**
 * Social Followers API
 * GET /api/social/followers - List users that follow the current user
 * v0.37.3 - Follow User Feature
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getFollowers } from '@/lib/social/followService';

export const runtime = 'nodejs';

/**
 * GET /api/social/followers
 * Returns list of users that follow the current user
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

  // Get follower IDs
  const followerIds = await getFollowers(user.id);

  if (followerIds.length === 0) {
    return successResponse({
      followers: [],
      totalFollowers: 0,
    });
  }

  // Get user details for followers
  const followers = await prisma.user.findMany({
    where: {
      id: { in: followerIds },
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
    followers: followers.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      level: u.level || 1,
      archetype: u.archetype,
    })),
    totalFollowers: followers.length,
  });
});

