/**
 * Mark All Notifications Read API
 * Mark all notifications as read for user
 * v0.40.17 - Story Notifications 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { markAllNotificationsRead } from '@/lib/notifications/notificationService';

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  try {
    await markAllNotificationsRead(user.id);

    return successResponse({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      error: error.message || 'Failed to mark all notifications as read',
    });
  }
});

