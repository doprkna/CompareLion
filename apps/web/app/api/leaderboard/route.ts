/**
 * Leaderboard API
 * Returns ranked users by XP, streak, and other metrics
 * v0.13.2n - Community Growth
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/db';
import { canAppearInLeaderboard } from '@/lib/middleware/privacy';

/**
 * GET /api/leaderboard?type=global|friends|weekly
 * Returns top 10 users + current user position
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'global';
  const currentUserId = session?.user?.id;

  // Base query for active users
  const baseWhere: any = {
    xp: { gt: 0 }, // Only users with XP
  };

  // Weekly filter - users who answered in last 7 days
  if (type === 'weekly') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    baseWhere.lastAnsweredAt = { gte: weekAgo };
  }

  // Friends filter - get user's friends
  let friendIds: string[] = [];
  if (type === 'friends' && currentUserId) {
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: currentUserId, status: 'ACCEPTED' },
          { friendId: currentUserId, status: 'ACCEPTED' },
        ],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });

    friendIds = friendships.map(f => 
      f.userId === currentUserId ? f.friendId : f.userId
    );

    if (friendIds.length === 0) {
      // No friends, return empty leaderboard with current user only
      if (currentUserId) {
        const currentUser = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: {
            id: true,
            name: true,
            email: true,
            xp: true,
            level: true,
            streakCount: true,
            avatarUrl: true,
            image: true,
          },
        });

        return successResponse({
          leaderboard: [],
          currentUser: currentUser ? {
            ...currentUser,
            rank: 0,
            displayName: currentUser.name || currentUser.email.split('@')[0],
          } : null,
          type,
        });
      }

      return successResponse({ leaderboard: [], currentUser: null, type });
    }

    baseWhere.id = { in: friendIds };
  }

  // Get top 10 users (v0.29.30 - Filter by privacy settings for global leaderboard)
  const allUsers = await prisma.user.findMany({
    where: baseWhere,
    orderBy: [
      { xp: 'desc' },
      { streakCount: 'desc' },
      { level: 'desc' },
    ],
    take: 50, // Get more to filter by privacy
    select: {
      id: true,
      name: true,
      email: true,
      xp: true,
      level: true,
      streakCount: true,
      avatarUrl: true,
      image: true,
      settings: true,
    },
  });

  // Filter users based on privacy (only public users appear in global leaderboard)
  let topUsers = allUsers;
  if (type === 'global') {
    const publicUsers = [];
    for (const user of allUsers) {
      const canAppear = await canAppearInLeaderboard(user.id);
      if (canAppear) {
        publicUsers.push({
          id: user.id,
          name: user.name,
          email: user.email,
          xp: user.xp,
          level: user.level,
          streakCount: user.streakCount,
          avatarUrl: user.avatarUrl,
          image: user.image,
        });
      }
      if (publicUsers.length >= 10) break;
    }
    topUsers = publicUsers;
  } else {
    // For friends/weekly, show first 10 (privacy handled by baseWhere)
    topUsers = allUsers.slice(0, 10).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streakCount: user.streakCount,
      avatarUrl: user.avatarUrl,
      image: user.image,
    }));
  }

  // Add ranks and format
  const leaderboard = topUsers.map((user, index) => ({
    ...user,
    rank: index + 1,
    displayName: user.name || user.email.split('@')[0],
  }));

  // Get current user's position if logged in
  let currentUserData = null;
  if (currentUserId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        streakCount: true,
        avatarUrl: true,
        image: true,
      },
    });

    if (currentUser) {
      // Find user's rank
      const usersAbove = await prisma.user.count({
        where: {
          ...baseWhere,
          OR: [
            { xp: { gt: currentUser.xp } },
            {
              xp: currentUser.xp,
              streakCount: { gt: currentUser.streakCount },
            },
          ],
        },
      });

      currentUserData = {
        ...currentUser,
        rank: usersAbove + 1,
        displayName: currentUser.name || currentUser.email.split('@')[0],
      };
    }
  }

  return successResponse({
    leaderboard,
    currentUser: currentUserData,
    type,
  });
});

