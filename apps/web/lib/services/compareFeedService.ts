/**
 * Compare Feed Service
 * Ranking and feed algorithms for Social Compare Feed 2.0
 * v0.36.31
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Calculate feed score for ranking
 * Formula: (reactions * 3) + (comments * 2) + ageDecay + clusteringBoost
 */
export function calculateFeedScore(
  reactionCount: number,
  commentCount: number,
  createdAt: Date,
  value?: any,
  allValues?: any[]
): number {
  const now = new Date();
  const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  // Age decay: -0.1 per hour (max -24 for 24h+ old posts)
  const ageDecay = Math.max(-24, -0.1 * ageHours);
  
  // Clustering boost: +5 if value matches other posts in feed (same-value clustering)
  let clusteringBoost = 0;
  if (value && allValues && allValues.length > 0) {
    const matchingValues = allValues.filter(v => JSON.stringify(v) === JSON.stringify(value));
    if (matchingValues.length > 1) {
      clusteringBoost = 5;
    }
  }
  
  const score = (reactionCount * 3) + (commentCount * 2) + ageDecay + clusteringBoost;
  return Math.max(0, score); // Ensure non-negative
}

/**
 * Get trending compare posts (last 24 hours, highest score)
 */
export async function getTrendingComparePosts(limit: number = 20) {
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  const posts = await prisma.comparePost.findMany({
    where: {
      createdAt: { gte: twentyFourHoursAgo },
      visibility: 'public',
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
          type: true,
          userId: true,
        },
      },
      comments: {
        take: 2,
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
          reactions: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit * 3, // Get more to calculate scores
  });
  
  // Calculate scores and sort
  const postsWithScores = posts.map(post => ({
    post,
    score: calculateFeedScore(
      post._count.reactions,
      post._count.comments,
      post.createdAt,
      post.value,
      posts.map(p => p.value)
    ),
  }));
  
  // Sort by score descending and take top N
  postsWithScores.sort((a, b) => b.score - a.score);
  return postsWithScores.slice(0, limit).map(item => item.post);
}

/**
 * Get compare post with full details (for single post view)
 */
export async function getComparePostById(postId: string, userId?: string) {
  const post = await prisma.comparePost.findUnique({
    where: { id: postId },
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
        orderBy: { createdAt: 'desc' },
      },
      comments: {
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
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          reactions: true,
          comments: true,
        },
      },
    },
  });
  
  return post;
}

/**
 * Get "People like you" feed (posts with similar values)
 * MVP: Simple implementation - can be enhanced later
 */
export async function getSimilarComparePosts(userId: string, limit: number = 20) {
  // Get user's recent compare posts to find their values
  const userPosts = await prisma.comparePost.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { value: true },
  });
  
  const userValues = userPosts.map(p => p.value).filter(Boolean);
  
  if (userValues.length === 0) {
    // Fallback to global feed if no user posts
    return getGlobalComparePosts(limit);
  }
  
  // Find posts with similar values (simple string matching for MVP)
  const posts = await prisma.comparePost.findMany({
    where: {
      userId: { not: userId }, // Exclude own posts
      visibility: 'public',
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
          type: true,
          userId: true,
        },
      },
      comments: {
        take: 2,
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
          reactions: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit * 2, // Get more to filter
  });
  
  // Filter posts with matching values and calculate scores
  const matchingPosts = posts
    .filter(post => {
      if (!post.value) return false;
      return userValues.some(uv => JSON.stringify(uv) === JSON.stringify(post.value));
    })
    .map(post => ({
      post,
      score: calculateFeedScore(
        post._count.reactions,
        post._count.comments,
        post.createdAt,
        post.value,
        posts.map(p => p.value)
      ),
    }));
  
  // Sort by score and take top N
  matchingPosts.sort((a, b) => b.score - a.score);
  return matchingPosts.slice(0, limit).map(item => item.post);
}

/**
 * Get global compare posts (all public posts, ranked by score)
 */
export async function getGlobalComparePosts(limit: number = 20, cursor?: string) {
  const cursorClause: any = {};
  if (cursor) {
    const [createdAt, id] = cursor.split('_');
    cursorClause.OR = [
      { createdAt: { lt: new Date(createdAt) } },
      { createdAt: new Date(createdAt), id: { lt: id } },
    ];
  }
  
  const posts = await prisma.comparePost.findMany({
    where: {
      visibility: 'public',
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
          type: true,
          userId: true,
        },
      },
      comments: {
        take: 2,
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
          reactions: true,
          comments: true,
        },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' },
    ],
    take: limit * 3, // Get more to calculate scores
  });
  
  // Calculate scores and sort
  const postsWithScores = posts.map(post => ({
    post,
    score: calculateFeedScore(
      post._count.reactions,
      post._count.comments,
      post.createdAt,
      post.value,
      posts.map(p => p.value)
    ),
  }));
  
  // Sort by score descending, then by createdAt
  postsWithScores.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.1) {
      // If scores are very close, use createdAt
      return b.post.createdAt.getTime() - a.post.createdAt.getTime();
    }
    return b.score - a.score;
  });
  
  return postsWithScores.slice(0, limit).map(item => item.post);
}

