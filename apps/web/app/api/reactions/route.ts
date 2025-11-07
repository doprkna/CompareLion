import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

/**
 * POST /api/reactions
 * Add a reaction to a reflection, comment, or message
 */

const AddReactionSchema = z.object({
  targetType: z.enum(['reflection', 'comment', 'message', 'user_reflection']),
  targetId: z.string().min(1, 'Target ID is required'),
  emoji: z.enum(['❤️', '😂', '👍', '😮', '😢', '🔥', '✨'], 'Invalid emoji'),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  const body = await req.json();
  const parsed = AddReactionSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid reaction data', parsed.error.issues);
  }

  const { targetType, targetId, emoji } = parsed.data;

  // Check if reaction already exists (upsert behavior)
  const existingReaction = await prisma.reaction.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.userId,
        targetType,
        targetId,
      },
    },
  });

  let reaction;

  if (existingReaction) {
    // Update existing reaction
    reaction = await prisma.reaction.update({
      where: { id: existingReaction.id },
      data: { emoji },
    });
  } else {
    // Create new reaction
    reaction = await prisma.reaction.create({
      data: {
        userId: user.userId,
        targetType,
        targetId,
        emoji,
      },
    });

    // Find target owner for notification
    let targetOwnerId: string | null = null;

    if (targetType === 'reflection') {
      const target = await prisma.reflectionEntry.findUnique({
        where: { id: targetId },
        select: { userId: true },
      });
      targetOwnerId = target?.userId || null;
    } else if (targetType === 'user_reflection') {
      const target = await prisma.userReflection.findUnique({
        where: { id: targetId },
        select: { userId: true },
      });
      targetOwnerId = target?.userId || null;
    } else if (targetType === 'comment') {
      const target = await prisma.comment.findUnique({
        where: { id: targetId },
        select: { userId: true },
      });
      targetOwnerId = target?.userId || null;
    }

    // Create notification for target owner (if not reacting to own content)
    if (targetOwnerId && targetOwnerId !== user.userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { username: true, name: true },
      });

      await prisma.notification.create({
        data: {
          userId: targetOwnerId,
          senderId: user.userId,
          type: 'LIKE',
          title: 'New reaction',
          body: `${currentUser?.username || currentUser?.name || 'Someone'} reacted ${emoji} to your ${targetType}`,
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.userId,
        type: 'reaction_added',
        title: 'Added reaction',
        description: `Reacted ${emoji} to ${targetType}`,
        metadata: { targetType, targetId, emoji },
      },
    });
  }

  return NextResponse.json({
    success: true,
    reaction: {
      id: reaction.id,
      emoji: reaction.emoji,
      targetType: reaction.targetType,
      targetId: reaction.targetId,
      createdAt: reaction.createdAt,
    },
  });
});

/**
 * DELETE /api/reactions
 * Remove a reaction
 */
const DeleteReactionSchema = z.object({
  targetType: z.string().min(1),
  targetId: z.string().min(1),
});

export const DELETE = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  const body = await req.json();
  const parsed = DeleteReactionSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid data', parsed.error.issues);
  }

  const { targetType, targetId } = parsed.data;

  // Delete reaction
  const deleted = await prisma.reaction.deleteMany({
    where: {
      userId: user.userId,
      targetType,
      targetId,
    },
  });

  if (deleted.count === 0) {
    return validationError('Reaction not found');
  }

  return NextResponse.json({
    success: true,
    message: 'Reaction removed',
  });
});

/**
 * GET /api/reactions
 * Get reactions for a target
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  if (!targetType || !targetId) {
    return validationError('targetType and targetId are required');
  }

  // Fetch reactions
  const reactions = await prisma.reaction.findMany({
    where: {
      targetType,
      targetId,
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

  // Group by emoji and count
  const grouped = reactions.reduce((acc: any, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasReacted: false,
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user);
    if (reaction.userId === user.userId) {
      acc[reaction.emoji].hasReacted = true;
    }
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    reactions: Object.values(grouped),
    totalCount: reactions.length,
  });
});
