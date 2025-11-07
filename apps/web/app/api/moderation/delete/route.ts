import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError, forbiddenError } from '@/lib/api-handler';
import { getAdminStatus } from '@/lib/adminAuth';
import { z } from 'zod';

/**
 * POST /api/moderation/delete
 * Delete content (soft delete for messages, hard delete for comments) - admin only
 */

const DeleteSchema = z.object({
  targetType: z.enum(['message', 'comment', 'reflection']),
  targetId: z.string().min(1),
  reason: z.string().min(1, 'Reason is required'),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  // Check admin status
  const isAdminUser = await getAdminStatus(user.userId, user.email);
  if (!isAdminUser) {
    return forbiddenError('Admin access required');
  }

  const body = await req.json();
  const parsed = DeleteSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid delete data', parsed.error.issues);
  }

  const { targetType, targetId, reason } = parsed.data;

  // Delete content
  if (targetType === 'message') {
    // Soft delete (hide from both sides)
    await prisma.message.update({
      where: { id: targetId },
      data: {
        hiddenBySender: true,
        hiddenByReceiver: true,
        flagged: false,
      },
    });
  } else if (targetType === 'comment') {
    // Hard delete
    await prisma.comment.delete({
      where: { id: targetId },
    });
  } else if (targetType === 'reflection') {
    // Set as private
    await prisma.reflectionEntry.update({
      where: { id: targetId },
      data: { isPrivate: true },
    });
  }

  // Log the action
  await prisma.moderationLog.create({
    data: {
      moderatorId: user.userId,
      action: 'DELETE_CONTENT',
      targetType,
      targetId,
      reason,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Content deleted successfully',
  });
});

