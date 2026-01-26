/**
 * Feed Post Detail API - ComparePost
 * GET /api/feed/post/[id] - Get single compare post with full details
 * DELETE /api/feed/post/[id] - Delete a compare post (owner only)
 * v0.36.31 - Social Compare Feed 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  validationError,
  notFoundError,
  forbiddenError,
  successResponse,
} from '@/lib/api-handler';
import { getComparePostById } from '@/lib/services/compareFeedService';
import { logger } from '@/lib/logger';

export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { id } = params;

  const post = await getComparePostById(id, user.id);

  if (!post) {
    return notFoundError('ComparePost');
  }

  // Check visibility
  if (post.visibility !== 'public' && post.userId !== user.id) {
    return forbiddenError('Post is not public');
  }

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

  return successResponse({
    post: {
      id: post.id,
      userId: post.userId,
      postType: 'compare',
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
      updatedAt: post.updatedAt,
      reactions: {
        counts: reactionCounts,
        userReactions,
        total: post._count.reactions,
        all: post.reactions.map((r: any) => ({
          id: r.id,
          type: r.type,
          userId: r.userId,
          user: {
            id: r.user.id,
            username: r.user.username,
            name: r.user.name,
            avatarUrl: r.user.avatarUrl,
          },
          createdAt: r.createdAt,
        })),
      },
      comments: {
        all: post.comments.map((c: any) => ({
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
    },
  });
});

export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { id } = params;

  // Verify post exists and belongs to user
  const post = await prisma.comparePost.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!post) {
    return notFoundError('ComparePost');
  }

  if (post.userId !== user.id) {
    return forbiddenError('You can only delete your own posts');
  }

  // Delete post (cascades to reactions and comments)
  await prisma.comparePost.delete({
    where: { id },
  });

  logger.debug(`[CompareFeed] Deleted post ${id} by user ${user.id}`);

  return successResponse({
    success: true,
    message: 'Post deleted',
  });
});

