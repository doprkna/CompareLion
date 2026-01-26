/**
 * Feed Comment API
 * POST /api/feed/comment - Add comment to a feed post
 * v0.36.25 - Community Feed 1.0
 * v0.36.31 - Social Compare Feed 2.0 - Added CompareComment support
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
  successResponse,
} from '@/lib/api-handler';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const CommentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(1).max(500),
  postType: z.enum(['feed', 'compare']).optional().default('feed'), // 'feed' or 'compare'
});

export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await req.json();
  const parsed = CommentSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid comment data', parsed.error.issues);
  }

  const { postId, content, postType } = parsed.data;

  // Rate limiting: 1 comment per 5 seconds (v0.36.31)
  const recentComment = await (postType === 'compare'
    ? prisma.compareComment.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 5000),
          },
        },
      })
    : prisma.feedComment.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 5000),
          },
        },
      }));

  if (recentComment) {
    return validationError('Please wait before commenting again');
  }

  // Handle CompareComment (v0.36.31)
  if (postType === 'compare') {
    // Verify compare post exists
    const comparePost = await prisma.comparePost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!comparePost) {
      return notFoundError('ComparePost');
    }

    // Create comment
    const comment = await prisma.compareComment.create({
      data: {
        postId,
        userId: user.id,
        content,
      },
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
    });

    // Create notification for post owner (if not self-comment)
    if (comparePost.userId !== user.id) {
      try {
        const { notifySocialInteraction } = await import('@/lib/services/notificationService');
        const username = comment.user.username || comment.user.name || 'Someone';
        await notifySocialInteraction(comparePost.userId, 'comment', username, postId);
      } catch (error) {
        logger.debug('[CompareComment] Notification failed', error);
      }
    }

    return successResponse({
      comment: {
        id: comment.id,
        userId: comment.userId,
        user: {
          id: comment.user.id,
          username: comment.user.username,
          name: comment.user.name,
          avatarUrl: comment.user.avatarUrl,
        },
        content: comment.content,
        createdAt: comment.createdAt,
      },
    });
  }

  // Handle FeedComment (original logic)
  // Verify post exists and get owner
  const post = await prisma.feedPost.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post) {
    return notFoundError('Post');
  }

  // Create comment
  const comment = await prisma.feedComment.create({
    data: {
      postId,
      userId: user.id,
      content,
    },
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
  });

  // Create notification for post owner (if not self-comment) (v0.36.26)
  if (post.userId !== user.id) {
    try {
      const { notifySocialInteraction } = await import('@/lib/services/notificationService');
      const username = comment.user.username || comment.user.name || 'Someone';
      await notifySocialInteraction(post.userId, 'comment', username, postId);
    } catch (error) {
      // Don't fail comment if notification fails
      logger.debug('[FeedComment] Notification failed', error);
    }
  }

  return successResponse({
    comment: {
      id: comment.id,
      userId: comment.userId,
      user: {
        id: comment.user.id,
        username: comment.user.username,
        name: comment.user.name,
        avatarUrl: comment.user.avatarUrl,
      },
      content: comment.content,
      createdAt: comment.createdAt,
    },
  });
});

