/**
 * Global Feed System
 * 
 * Helper functions for creating and managing community feed events.
 */

import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";

export interface FeedItemData {
  type: string;
  title: string;
  description?: string;
  userId: string;
  metadata?: any;
}

/**
 * Create a new global feed item
 */
export async function createFeedItem(data: FeedItemData) {
  const feedItem = await prisma.globalFeedItem.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description,
      userId: data.userId,
      metadata: data.metadata,
    },
  });

  // Publish real-time event
  await publishEvent("feed:new", {
    id: feedItem.id,
    type: feedItem.type,
    title: feedItem.title,
    userId: feedItem.userId,
  });

  return feedItem;
}

/**
 * Log achievement unlock to feed
 */
export async function logAchievementToFeed(
  userId: string,
  achievementTitle: string,
  achievementIcon: string,
  xpReward: number
) {
  return await createFeedItem({
    type: "achievement",
    title: `${achievementTitle}`,
    description: `Earned +${xpReward} XP`,
    userId,
    metadata: {
      icon: achievementIcon,
      xp: xpReward,
    },
  });
}

/**
 * Log challenge completion to feed
 */
export async function logChallengeToFeed(
  userId: string,
  challengeType: string,
  wasAccepted: boolean
) {
  return await createFeedItem({
    type: "challenge",
    title: wasAccepted
      ? `Accepted a ${challengeType} challenge`
      : `Completed a ${challengeType} challenge`,
    userId,
    metadata: {
      challengeType,
      status: wasAccepted ? "accepted" : "completed",
    },
  });
}

/**
 * Log quiz/flow completion to feed
 */
export async function logQuizToFeed(
  userId: string,
  categoryName: string,
  correctAnswers: number,
  totalQuestions: number
) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return await createFeedItem({
    type: "quiz",
    title: `Completed ${categoryName} quiz`,
    description: `${correctAnswers}/${totalQuestions} correct (${percentage}%)`,
    userId,
    metadata: {
      category: categoryName,
      correct: correctAnswers,
      total: totalQuestions,
      percentage,
    },
  });
}

/**
 * Log duel result to feed
 */
export async function logDuelToFeed(
  userId: string,
  opponentName: string,
  won: boolean,
  score?: string
) {
  return await createFeedItem({
    type: "duel",
    title: won ? `Won a duel against ${opponentName}!` : `Challenged ${opponentName} to a duel`,
    description: score,
    userId,
    metadata: {
      opponent: opponentName,
      won,
      score,
    },
  });
}

/**
 * Log group join to feed
 */
export async function logGroupJoinToFeed(
  userId: string,
  groupName: string,
  groupEmblem: string
) {
  return await createFeedItem({
    type: "group_join",
    title: `Joined ${groupEmblem} ${groupName}`,
    userId,
    metadata: {
      groupName,
      groupEmblem,
    },
  });
}

/**
 * Log level up to feed
 */
export async function logLevelUpToFeed(
  userId: string,
  newLevel: number,
  archetype?: string
) {
  return await createFeedItem({
    type: "level_up",
    title: `Reached level ${newLevel}!`,
    description: archetype ? `as ${archetype}` : undefined,
    userId,
    metadata: {
      level: newLevel,
      archetype,
    },
  });
}

/**
 * Add reaction to feed item
 */
export async function addFeedReaction(
  feedItemId: string,
  userId: string,
  emoji: string
) {
  // Create or update reaction
  const reaction = await prisma.reaction.upsert({
    where: {
      userId_targetType_targetId: {
        userId,
        targetType: "feed",
        targetId: feedItemId,
      },
    },
    update: {
      emoji,
    },
    create: {
      userId,
      targetType: "feed",
      targetId: feedItemId,
      emoji,
    },
  });

  // Update cached reaction count
  await prisma.globalFeedItem.update({
    where: { id: feedItemId },
    data: {
      reactionsCount: {
        increment: 1,
      },
    },
  });

  // Publish real-time event
  await publishEvent("feed:reaction", {
    feedItemId,
    userId,
    emoji,
  });

  return reaction;
}

/**
 * Remove reaction from feed item
 */
export async function removeFeedReaction(
  feedItemId: string,
  userId: string
) {
  await prisma.reaction.deleteMany({
    where: {
      userId,
      targetType: "feed",
      targetId: feedItemId,
    },
  });

  // Update cached reaction count
  await prisma.globalFeedItem.update({
    where: { id: feedItemId },
    data: {
      reactionsCount: {
        decrement: 1,
      },
    },
  });

  // Publish real-time event
  await publishEvent("feed:reaction_removed", {
    feedItemId,
    userId,
  });
}

/**
 * Get trending feed items (most reactions in last 24h)
 */
export async function getTrendingFeedItems(limit: number = 20) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return await prisma.globalFeedItem.findMany({
    where: {
      createdAt: {
        gte: oneDayAgo,
      },
    },
    orderBy: [
      { reactionsCount: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          level: true,
        },
      },
      reactions: {
        select: {
          id: true,
          emoji: true,
          userId: true,
        },
      },
    },
  });
}

/**
 * Get feed items from friends
 */
export async function getFriendsFeedItems(userId: string, limit: number = 50) {
  // Get user's friends
  const friendships = await prisma.friend.findMany({
    where: {
      OR: [
        { userId, status: "accepted" },
        { friendId: userId, status: "accepted" },
      ],
    },
    select: {
      userId: true,
      friendId: true,
    },
  });

  const friendIds = friendships.map((f) =>
    f.userId === userId ? f.friendId : f.userId
  );

  // Get feed items from friends
  return await prisma.globalFeedItem.findMany({
    where: {
      userId: {
        in: [...friendIds, userId], // Include user's own items
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          level: true,
        },
      },
      reactions: {
        select: {
          id: true,
          emoji: true,
          userId: true,
        },
      },
    },
  });
}











