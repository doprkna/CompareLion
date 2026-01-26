/**
 * Mark Notification Read API
 * Mark a notification as read
 * v0.40.17 - Story Notifications 1.0
 * v0.41.5 - C3 Step 6: Unified API envelope
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import { markNotificationRead } from '@/lib/notifications/notificationService';

/**
 * POST /api/notifications/read
 * Mark notification as read
 * Body: { id: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'User not found');
  }

  const body = await req.json();
  const { id } = body;

  if (!id || typeof id !== 'string') {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'id is required');
  }

  try {
    await markNotificationRead(id, user.id);

    return buildSuccess(req, {
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, error.message || 'Failed to mark notification as read');
  }
});
