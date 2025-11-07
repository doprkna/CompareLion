import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError } from '@/lib/api-handler';
import { moderateContent, shouldRateLimit } from '@/lib/moderation';
import { z } from 'zod';

/**
 * POST /api/comments
 * Create a comment on a reflection or comparison
 */

const CreateCommentSchema = z.object({
  targetType: z.enum(['reflection', 'comparison', 'user_reflection']),
  targetId: z.string().min(1, 'Target ID is required'),
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  // Check rate limiting
  const isRateLimited = await shouldRateLimit(user.userId, prisma);
  if (isRateLimited) {
    return validationError('You have been rate limited due to flagged content. Please try again later.');
  }

  const body = await req.json();
  const parsed = CreateCommentSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid comment data', parsed.error.issues);
  }

  const { targetType, targetId, content } = parsed.data;

  // Verify target exists based on type
  let targetOwnerId: string | null = null;

  if (targetType === 'reflection') {
    const reflection = await prisma.reflectionEntry.findUnique({
      where: { id: targetId },
      select: { userId: true, isPrivate: true },
    });

    if (!reflection) {
      return validationError('Target not found');
    }

    if (reflection.isPrivate && reflection.userId !== user.userId) {
      return validationError('Cannot comment on private reflection');
    }

    targetOwnerId = reflection.userId;
  } else if (targetType === 'user_reflection') {
    const reflection = await prisma.userReflection.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });

    if (!reflection) {
      return validationError('Target not found');
    }

    targetOwnerId = reflection.userId;
  }

  // Moderate content
  const moderation = moderateContent(content);

  // Create comment
  const comment = await prisma.comment.create({
    data: {
      userId: user.userId,
      targetType,
      targetId,
      content,
      flagged: moderation.flagged,
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

  // Create notification for target owner (if not commenting on own content)
  if (targetOwnerId && targetOwnerId !== user.userId) {
    await prisma.notification.create({
      data: {
        userId: targetOwnerId,
        senderId: user.userId,
        type: 'COMMENT',
        title: 'New comment',
        body: `${comment.user.username || comment.user.name || 'Someone'} commented on your ${targetType}`,
      },
    });
  }

  // Log activity
  await prisma.activity.create({
    data: {
      userId: user.userId,
      type: 'comment_created',
      title: 'Posted a comment',
      description: `Commented on ${targetType}`,
      metadata: { targetType, targetId },
    },
  });

  return NextResponse.json({
    success: true,
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.user,
      flagged: comment.flagged,
      moderationWarning: moderation.flagged ? moderation.reasons : undefined,
    },
  });
});

