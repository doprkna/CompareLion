/**
 * Social Feed API
 * GET /api/social/feed - Get paginated social feed from followed users
 * v0.36.42 - Social Systems 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getFollowing } from '@/lib/social/followService';
import { filterBlockedUsers } from '@/lib/social/blockService';
import { formatActivityDisplay } from '@/lib/social/types';
import { SocialFeedQuerySchema } from '@/lib/social/schemas';

export const runtime = 'nodejs';

/**
 * GET /api/social/feed
 * Get paginated social feed from users you follow
 * Query params: limit, cursor, userId (filter), type (filter)
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

  const { searchParams } = new URL(req.url);
  const validation = SocialFeedQuerySchema.safeParse({
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    cursor: searchParams.get('cursor') || undefined,
    userId: searchParams.get('userId') || undefined,
    type: searchParams.get('type') || undefined,
  });

  if (!validation.success) {
    return unauthorizedError('Invalid query parameters');
  }

  const { limit, cursor, userId: filterUserId, type } = validation.data;

  // Get users being followed
  let followingIds: string[] = [];
  
  if (filterUserId) {
    // Filter by specific user
    followingIds = [filterUserId];
  } else {
    // Get all users being followed
    followingIds = await getFollowing(user.id);
  }

  if (followingIds.length === 0) {
    return successResponse({
      feed: [],
      nextCursor: null,
      hasMore: false,
    });
  }

  // Filter out blocked users
  const allowedUserIds = await filterBlockedUsers(user.id, followingIds);

  if (allowedUserIds.length === 0) {
    return successResponse({
      feed: [],
      nextCursor: null,
      hasMore: false,
    });
  }

  // Build where clause
  const where: any = {
    userId: { in: allowedUserIds },
  };

  if (type) {
    where.type = type;
  }

  // Fetch activities
  const activities = await prisma.socialActivity.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  const hasMore = activities.length > limit;
  const items = hasMore ? activities.slice(0, limit) : activities;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  // Format feed items
  const feed = items.map(activity => ({
    id: activity.id,
    userId: activity.userId,
    username: activity.user?.username,
    name: activity.user?.name,
    type: activity.type,
    refId: activity.refId,
    metadata: activity.metadata as Record<string, any> | null,
    timestamp: activity.timestamp.toISOString(),
    displayText: formatActivityDisplay(
      {
        id: activity.id,
        userId: activity.userId,
        type: activity.type as any,
        refId: activity.refId,
        timestamp: activity.timestamp,
        user: activity.user || undefined,
      },
      activity.metadata as Record<string, any> | undefined
    ),
  }));

  return successResponse({
    feed,
    nextCursor,
    hasMore,
  });
});
