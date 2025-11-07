import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import {
  createFeedItem,
  addFeedReaction,
  removeFeedReaction,
  getTrendingFeedItems,
  getFriendsFeedItems,
} from "@/lib/feed";
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError } from "@/lib/api-handler";

/**
 * GET /api/feed
 * Get feed items with optional filters
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all"; // all, friends, trending
  const limit = parseInt(searchParams.get("limit") || "50");

  const session = await getServerSession(authOptions);
  let feedItems;

  if (filter === "trending") {
    // Get trending items (most reactions in last 24h)
    feedItems = await getTrendingFeedItems(limit);
  } else if (filter === "friends" && session?.user?.email) {
    // Get items from friends only
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return notFoundError('User');
    }

    feedItems = await getFriendsFeedItems(user.id, limit);
  } else {
      // Get all feed items (public feed)
      feedItems = await prisma.globalFeedItem.findMany({
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

    // Get current user's reactions if logged in
    let userReactions: Record<string, string> = {};
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        const reactions = await prisma.reaction.findMany({
          where: {
            userId: user.id,
            targetType: "feed",
            targetId: {
              in: feedItems.map((item) => item.id),
            },
          },
        });

        userReactions = reactions.reduce((acc, r) => {
          acc[r.targetId] = r.emoji;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // Format feed items with reaction summary
    const formattedItems = feedItems.map((item) => {
      // Group reactions by emoji
      const reactionSummary = item.reactions.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        metadata: item.metadata,
        createdAt: item.createdAt,
        user: {
          id: item.user.id,
          name: item.user.name || item.user.email.split("@")[0],
          image: item.user.image,
          level: item.user.level,
        },
        reactions: reactionSummary,
        totalReactions: item.reactionsCount,
        userReaction: userReactions[item.id] || null,
    };
  });

  return successResponse({
    items: formattedItems,
    filter,
    count: formattedItems.length,
  });
});

/**
 * POST /api/feed
 * Create a new feed item or add reaction
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return notFoundError('User');
  }

  const body = await req.json();
  const { action, feedItemId, emoji, type, title, description, metadata } = body;

  // Add or remove reaction
  if (action === "react") {
    if (!feedItemId || !emoji) {
      return validationError('feedItemId and emoji required');
    }

    await addFeedReaction(feedItemId, user.id, emoji);

    return successResponse(undefined, 'Reaction added');
  }

  if (action === "unreact") {
    if (!feedItemId) {
      return validationError('feedItemId required');
    }

    await removeFeedReaction(feedItemId, user.id);

    return successResponse(undefined, 'Reaction removed');
  }

  // Create new feed item
  if (!type || !title) {
    return validationError('type and title required');
  }

  const feedItem = await createFeedItem({
    type,
    title,
    description,
    userId: user.id,
    metadata,
  });

  return successResponse({
    feedItem: {
      id: feedItem.id,
      type: feedItem.type,
      title: feedItem.title,
      description: feedItem.description,
      createdAt: feedItem.createdAt,
    },
  }, 'Feed item created');
});













