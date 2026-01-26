/**
 * Feed API
 * GET /api/feed - Get feed posts with pagination and filters
 * v0.36.25 - Community Feed 1.0
 * v0.36.31 - Social Compare Feed 2.0
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3 - Added ComparePost support with ranking
 * v0.41.6 - C3 Step 7: Unified API envelope
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import type { FeedPostDTO, ComparePostDTO, FeedResponseDTO } from '@parel/types/dto';
import {
  getGlobalComparePosts,
  getTrendingComparePosts,
  getSimilarComparePosts,
} from '@/lib/services/compareFeedService';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'User not found');
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const filter = searchParams.get('filter') || 'all';
  const feedType = searchParams.get('feedType') || 'feed'; // 'feed' | 'compare' | 'all'
  const type = searchParams.get('type') || 'global'; // 'global' | 'trending' | 'similar' (for compare feed)

  // Validate limit
  if (limit > 50) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Limit cannot exceed 50');
  }

  // Handle ComparePost feed (v0.36.31)
  if (feedType === 'compare' || feedType === 'all') {
    let comparePosts: any[] = [];
    
    try {
      if (type === 'trending') {
        comparePosts = await getTrendingComparePosts(limit);
      } else if (type === 'similar') {
        comparePosts = await getSimilarComparePosts(user.id, limit);
      } else {
        // global
        comparePosts = await getGlobalComparePosts(limit, cursor);
      }
      
      // Format compare posts
      const formattedComparePosts: ComparePostDTO[] = await Promise.all(
        comparePosts.map(async (post) => {
          // Aggregate reactions by type
          const reactionCounts: Record<string, number> = {};
          const userReactions: string[] = [];
          post.reactions.forEach((reaction: any) => {
            reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
            if (reaction.userId === user.id) {
              userReactions.push(reaction.type);
            }
          });
          
          // Get question context if questionId exists
          let questionContext: any = null;
          if (post.questionId) {
            try {
              const question = await prisma.questionTemplate.findUnique({
                where: { id: post.questionId },
                select: { text: true, id: true },
              });
              if (question) {
                questionContext = {
                  id: question.id,
                  text: question.text,
                };
              }
            } catch (error) {
              // Ignore if question not found
            }
          }
          
          return {
            id: post.id,
            userId: post.userId,
            postType: 'compare', // Mark as compare post
            user: {
              id: post.user.id,
              username: post.user.username,
              name: post.user.name,
              avatarUrl: post.user.avatarUrl,
              level: post.user.level,
            },
            questionId: post.questionId,
            questionContext,
            content: post.content,
            value: post.value,
            createdAt: post.createdAt,
            reactions: {
              counts: reactionCounts,
              userReactions,
              total: post._count.reactions,
            },
            comments: {
              preview: post.comments?.slice(0, 2).map((c: any) => ({
                id: c.id,
                userId: c.userId,
                user: {
                  id: c.user.id,
                  username: c.user.username,
                  name: c.user.name,
                  avatarUrl: c.user.avatarUrl,
                },
                content: c.content,
                createdAt: c.createdAt,
              })) || [],
              total: post._count.comments,
            },
          };
        })
      );
      
      // If feedType is 'compare', return only compare posts
      if (feedType === 'compare') {
        const hasMore = comparePosts.length >= limit;
        const nextCursor =
          hasMore && formattedComparePosts.length > 0
            ? `_`
            : null;
        
        const response: FeedResponseDTO = {
          posts: formattedComparePosts,
          nextCursor,
          hasMore,
        };
        return buildSuccess(req, response);
      }
      
      // If feedType is 'all', we'll merge with FeedPost below
      // For now, return compare posts (FeedPost merging can be added later)
      const hasMore = comparePosts.length >= limit;
      const nextCursor =
        hasMore && formattedComparePosts.length > 0
          ? `${formattedComparePosts[formattedComparePosts.length - 1].createdAt.toISOString()}_`
          : null;
      
      const response: FeedResponseDTO = {
        posts: formattedComparePosts,
        nextCursor,
        hasMore,
      };
      return buildSuccess(req, response);
    } catch (error) {
      // Fall through to FeedPost if compare feed fails
      console.error('[FeedAPI] Compare feed error', error);
    }
  }

  // Original FeedPost logic (v0.36.25)
  // Build where clause based on filter
  const where: any = {
    visibility: 'public', // Only show public posts for now
  };

  if (filter === 'me') {
    where.userId = user.id;
  } else if (filter === 'fights') {
    where.type = 'fight';
  } else if (filter === 'achievements') {
    where.type = 'achievement';
  } else if (filter === 'questions') {
    where.type = 'question';
  }
  // 'all' and 'friends' (future) show all public posts

  // Build cursor pagination
  const cursorClause: any = {};
  if (cursor) {
    const [createdAt, id] = cursor.split('_');
    cursorClause.OR = [
      { createdAt: { lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), id: { lt: id } },
    ];
  }

  // Fetch posts
  const posts = await prisma.feedPost.findMany({
    where: {
      ...where,
      ...cursorClause,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
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
      comments: {
        take: 2, // Preview last 2 comments
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' },
    ],
    take: limit + 1, // Fetch one extra to check if there's more
  });

  // Check if there are more posts
  const hasMore = posts.length > limit;
  const feedPosts = hasMore ? posts.slice(0, limit) : posts;

  // Format posts with rich preview data
  const formattedPosts: FeedPostDTO[] = await Promise.all(
    feedPosts.map(async (post) => {
      // Get rich preview data based on type
      let preview: any = null;

      if (post.type === 'fight' && post.refId) {
        // Try to get fight details
        try {
          const fight = await prisma.fight.findUnique({
            where: { id: post.refId },
            select: {
              winner: true,
              rounds: true,
            },
          });
          if (fight) {
            preview = {
              won: fight.winner === 'hero',
              rounds: Array.isArray(fight.rounds) ? fight.rounds.length : 0,
            };
          }
        } catch (error) {
          // Ignore if fight not found
        }
      } else if (post.type === 'loot' && post.refId) {
        // Get item details
        try {
          const item = await prisma.item.findUnique({
            where: { id: post.refId },
            select: {
              name: true,
              icon: true,
              rarity: true,
            },
          });
          if (item) {
            preview = {
              itemName: item.name,
              icon: item.icon,
              rarity: item.rarity,
            };
          }
        } catch (error) {
          // Ignore if item not found
        }
      } else if (post.type === 'achievement' && post.refId) {
        // Get achievement details
        try {
          const achievement = await prisma.achievement.findUnique({
            where: { id: post.refId },
            select: {
              title: true,
              icon: true,
            },
          });
          if (achievement) {
            preview = {
              title: achievement.title,
              icon: achievement.icon,
            };
          }
        } catch (error) {
          // Ignore if achievement not found
        }
      }

      // Aggregate reactions by emoji
      const reactionCounts: Record<string, number> = {};
      const userReactions: string[] = [];
      post.reactions.forEach((reaction) => {
        reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1;
        if (reaction.userId === user.id) {
          userReactions.push(reaction.emoji);
        }
      });

      return {
        id: post.id,
        userId: post.userId,
        postType: 'feed', // Mark as feed post
        user: {
          id: post.user.id,
          username: post.user.username,
          name: post.user.name,
          avatarUrl: post.user.avatarUrl,
          level: post.user.level,
        },
        type: post.type,
        content: post.content,
        refId: post.refId,
        preview,
        createdAt: post.createdAt,
        reactions: {
          counts: reactionCounts,
          userReactions,
          total: post._count.reactions,
        },
        comments: {
          preview: post.comments.map((c) => ({
            id: c.id,
            userId: c.userId,
            user: {
              id: c.user.id,
              username: c.user.username,
              name: c.user.name,
              avatarUrl: c.user.avatarUrl,
            },
            content: c.content,
            createdAt: c.createdAt,
          })),
          total: post._count.comments,
        },
      };
    })
  );

  // Generate next cursor
  const nextCursor =
    hasMore && formattedPosts.length > 0
      ? `${formattedPosts[formattedPosts.length - 1].createdAt.toISOString()}_`
      : null;

  const response: FeedResponseDTO = {
    posts: formattedPosts,
    nextCursor,
    hasMore,
  };

  return buildSuccess(req, response);
});

