import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError } from '@/lib/api-handler';
import { getAdminStatus } from '@/lib/adminAuth';
import { z } from 'zod';

/**
 * POST /api/moderation/review
 * Mark content as reviewed (unflag it) - admin only
 */

const ReviewSchema = z.object({
  targetType: z.enum(['message', 'comment']),
  targetId: z.string().min(1),
  reason: z.string().optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  // Check admin status
  const isAdminUser = await getAdminStatus(user.userId, user.email);
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid review data', parsed.error.issues);
  }

  const { targetType, targetId, reason } = parsed.data;

  // Mark as reviewed (unflag)
  if (targetType === 'message') {
    await prisma.message.update({
      where: { id: targetId },
      data: { flagged: false },
    });
  } else if (targetType === 'comment') {
    await prisma.comment.update({
      where: { id: targetId },
      data: { flagged: false },
    });
  }

  // Log the action
  await prisma.moderationLog.create({
    data: {
      moderatorId: user.userId,
      action: 'MARK_REVIEWED',
      targetType,
      targetId,
      reason: reason || 'Content reviewed and approved',
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Content marked as reviewed',
  });
});

