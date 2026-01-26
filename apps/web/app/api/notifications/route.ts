/**
 * Notifications API
 * Get user notifications
 * v0.40.17 - Story Notifications 1.0
 * v0.41.4 - C3 Step 5: Unified API envelope
 * v0.41.9 - C3 Step 10: DTO Consolidation Batch #2
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import type { NotificationDTO, NotificationsResponseDTO } from '@parel/types/dto';
import { getNotifications, getUnreadCount } from '@/lib/notifications/notificationService';

/**
 * GET /api/notifications
 * Get user notifications
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  try {
    const notifications = await getNotifications(user.id);
    const unreadCount = await getUnreadCount(user.id);

    const response: NotificationsResponseDTO = {
      notifications,
      unreadCount,
    };

    return buildSuccess(req, response);
  } catch (error: any) {
    return buildError(req, ApiErrorCode.INTERNAL_ERROR, error.message || 'Failed to fetch notifications');
  }
});
