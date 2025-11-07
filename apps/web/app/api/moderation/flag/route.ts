import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

/**
 * POST /api/moderation/flag
 * Flag content as inappropriate
 */

const FlagContentSchema = z.object({
  targetType: z.enum(['message', 'comment']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason too long'),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  const body = await req.json();
  const parsed = FlagContentSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid flag data', parsed.error.issues);
  }

  const { targetType, targetId, reason } = parsed.data;

  // Update the flagged field based on type
  if (targetType === 'message') {
    const message = await prisma.message.findUnique({
      where: { id: targetId },
      select: { id: true, senderId: true },
    });

    if (!message) {
      return validationError('Message not found');
    }

    // Cannot flag own messages
    if (message.senderId === user.userId) {
      return validationError('Cannot flag own content');
    }

    await prisma.message.update({
      where: { id: targetId },
      data: { flagged: true },
    });

    // Create notification for sender (warning)
    await prisma.notification.create({
      data: {
        userId: message.senderId,
        type: 'SYSTEM',
        title: 'Content flagged',
        body: 'One of your messages has been flagged for review.',
      },
    });
  } else if (targetType === 'comment') {
    const comment = await prisma.comment.findUnique({
      where: { id: targetId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      return validationError('Comment not found');
    }

    // Cannot flag own comments
    if (comment.userId === user.userId) {
      return validationError('Cannot flag own content');
    }

    await prisma.comment.update({
      where: { id: targetId },
      data: { flagged: true },
    });

    // Create notification for comment author (warning)
    await prisma.notification.create({
      data: {
        userId: comment.userId,
        type: 'SYSTEM',
        title: 'Content flagged',
        body: 'One of your comments has been flagged for review.',
      },
    });
  }

  // Log the flag action
  await prisma.activity.create({
    data: {
      userId: user.userId,
      type: 'content_flagged',
      title: 'Flagged content',
      description: `Flagged ${targetType}`,
      metadata: { targetType, targetId, reason },
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Content has been flagged for review. Thank you for helping keep PareL safe.',
  });
});

