import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError } from '@/lib/api-handler';
import { getAdminStatus } from '@/lib/adminAuth';
import { z } from 'zod';

/**
 * POST /api/moderation/ban
 * Ban a user (set visibility to PRIVATE and banned flag) - admin only
 */

const BanSchema = z.object({
  userId: z.string().min(1),
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
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = BanSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid ban data', parsed.error.issues);
  }

  const { userId, reason } = parsed.data;

  // Cannot ban yourself
  if (userId === user.userId) {
    return validationError('Cannot ban yourself');
  }

  // Cannot ban other admins
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (targetUser?.role === 'ADMIN' || targetUser?.role === 'DEVOPS') {
    return validationError('Cannot ban other administrators');
  }

  // Ban user
  await prisma.user.update({
    where: { id: userId },
    data: {
      banned: true,
      visibility: 'PRIVATE',
    },
  });

  // Create notification for banned user
  await prisma.notification.create({
    data: {
      userId,
      type: 'SYSTEM',
      title: 'Account Suspended',
      body: `Your account has been suspended due to violations of community guidelines. Reason: ${reason}`,
    },
  });

  // Log the action
  await prisma.moderationLog.create({
    data: {
      moderatorId: user.userId,
      action: 'BAN_USER',
      targetType: 'user',
      targetId: userId,
      reason,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'User banned successfully',
  });
});

