/**
 * Feed Reaction API
 * POST /api/feed/react - Add or remove reaction to a feed post
 * v0.36.25 - Community Feed 1.0
 * v0.36.31 - Social Compare Feed 2.0 - Added ComparePost support
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

const ALLOWED_EMOJIS = ['👍', '🔥', '❤️', '💡'];
const ALLOWED_COMPARE_TYPES = ['like', 'wow', 'same', 'lol', 'roast'];

// Support both FeedPost (emoji) and ComparePost (type)
const ReactionSchema = z.object({
  postId: z.string().min(1),
  emoji: z.enum(['👍', '🔥', '❤️', '💡']).optional(),
  type: z.enum(['like', 'wow', 'same', 'lol', 'roast']).optional(),
  postType: z.enum(['feed', 'compare']).optional().default('feed'), // 'feed' or 'compare'
}).refine(data => data.emoji || data.type, {
  message: 'Either emoji (for feed posts) or type (for compare posts) is required',
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
  const parsed = ReactionSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid reaction data', parsed.error.issues);
  }

  const { postId, emoji, type, postType } = parsed.data;

  // Handle ComparePost reactions (v0.36.31)
  if (postType === 'compare' && type) {
    // Verify compare post exists
    const comparePost = await prisma.comparePost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!comparePost) {
      return notFoundError('ComparePost');
    }

    // Check if reaction already exists
    const existing = await prisma.compareReaction.findUnique({
      where: {
        postId_userId_type: {
          postId,
          userId: user.id,
          type,
        },
      },
    });

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.compareReaction.delete({
        where: { id: existing.id },
      });

      return successResponse({
        reacted: false,
        type,
        message: 'Reaction removed',
      });
    } else {
      // Add reaction
      await prisma.compareReaction.create({
        data: {
          postId,
          userId: user.id,
          type,
        },
      });

      // Create notification for post owner (if not self-reaction)
      if (comparePost.userId !== user.id) {
        try {
          const { notifySocialInteraction } = await import('@/lib/services/notificationService');
          const username = user.username || user.name || 'Someone';
          await notifySocialInteraction(comparePost.userId, 'reaction', username, postId);
        } catch (error) {
          logger.debug('[CompareReact] Notification failed', error);
        }
      }

      return successResponse({
        reacted: true,
        type,
        message: 'Reaction added',
      });
    }
  }

  // Handle FeedPost reactions (original logic)
  if (!emoji) {
    return validationError('Emoji is required for feed posts');
  }

  // Verify post exists and get owner
  const post = await prisma.feedPost.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post) {
    return notFoundError('Post');
  }

  // Check if reaction already exists
  const existing = await prisma.feedReaction.findUnique({
    where: {
      postId_userId_emoji: {
        postId,
        userId: user.id,
        emoji,
      },
    },
  });

  if (existing) {
    // Remove reaction (toggle off)
    await prisma.feedReaction.delete({
      where: { id: existing.id },
    });

    return successResponse({
      reacted: false,
      emoji,
      message: 'Reaction removed',
    });
  } else {
    // Add reaction
    await prisma.feedReaction.create({
      data: {
        postId,
        userId: user.id,
        emoji,
      },
    });

    // Create notification for post owner (if not self-reaction) (v0.36.26)
    if (post.userId !== user.id) {
      try {
        const { notifySocialInteraction } = await import('@/lib/services/notificationService');
        const postOwner = await prisma.user.findUnique({
          where: { id: post.userId },
          select: { username: true, name: true },
        });
        const username = user.username || user.name || 'Someone';
        await notifySocialInteraction(post.userId, 'reaction', username, postId);
      } catch (error) {
        // Don't fail reaction if notification fails
        logger.debug('[FeedReact] Notification failed', error);
      }
    }

    return successResponse({
      reacted: true,
      emoji,
      message: 'Reaction added',
    });
  }
});

