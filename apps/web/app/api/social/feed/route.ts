import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/social/feed
 * Returns aggregated social events (friends' achievements, reflections, duels)
 * Auto-expires entries after 7 days
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  // Get user's accepted friendships
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userA: user.id },
        { userB: user.id },
      ],
      status: "accepted",
    },
    select: {
      userA: true,
      userB: true,
    },
  });

  // Get friend IDs
  const friendIds = friendships.map((f) => 
    f.userA === user.id ? f.userB : f.userA
  );

  if (friendIds.length === 0) {
    return successResponse({
      success: true,
      feed: [],
      message: "No friends to show feed from",
    });
  }

  // Calculate 7 days ago timestamp
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const feedItems: any[] = [];

  // Get recent badges from friends (last 7 days)
  const recentBadges = await prisma.userBadge.findMany({
    where: {
      userId: { in: friendIds },
      unlockedAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      badge: {
        select: {
          name: true,
          icon: true,
          rarity: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    take: 10,
    orderBy: {
      unlockedAt: "desc",
    },
  });

  recentBadges.forEach((userBadge) => {
    feedItems.push({
      type: "badge",
      userId: userBadge.userId,
      username: userBadge.user.username || userBadge.user.name,
      data: {
        badgeName: userBadge.badge.name,
        badgeIcon: userBadge.badge.icon,
        rarity: userBadge.badge.rarity,
      },
      timestamp: userBadge.unlockedAt,
    });
  });

  // Get recent duels from friends (last 7 days)
  const recentDuels = await prisma.socialDuel.findMany({
    where: {
      OR: [
        { challengerId: { in: friendIds } },
        { opponentId: { in: friendIds } },
      ],
      status: "completed",
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      challenger: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      opponent: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      winner: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  });

  recentDuels.forEach((duel) => {
    feedItems.push({
      type: "duel",
      userId: duel.winnerId,
      username: duel.winner?.username || "Unknown",
      data: {
        challenger: duel.challenger.username || duel.challenger.name,
        opponent: duel.opponent.username || duel.opponent.name,
        winner: duel.winner?.username || "Unknown",
        challengeType: duel.challengeType,
        rewardXP: duel.rewardXP,
      },
      timestamp: duel.createdAt,
    });
  });

  // Get recent quest completions from friends (last 7 days)
  const recentQuestCompletions = await prisma.userQuest.findMany({
    where: {
      userId: { in: friendIds },
      isCompleted: true,
      completedAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      quest: {
        select: {
          title: true,
          type: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
    take: 10,
    orderBy: {
      completedAt: "desc",
    },
  });

  recentQuestCompletions.forEach((userQuest) => {
    feedItems.push({
      type: "quest",
      userId: userQuest.userId,
      username: userQuest.user.username || userQuest.user.name,
      data: {
        questTitle: userQuest.quest.title,
        questType: userQuest.quest.type,
      },
      timestamp: userQuest.completedAt,
    });
  });

  // Sort by timestamp (most recent first)
  feedItems.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Limit to 50 items to prevent spam
  const limitedFeed = feedItems.slice(0, 50);

  return successResponse({
    success: true,
    feed: limitedFeed,
    count: limitedFeed.length,
  });
});

