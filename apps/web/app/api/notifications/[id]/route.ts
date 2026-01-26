/**
 * Notification Detail API
 * DELETE /api/notifications/[id] - Delete a notification
 * v0.36.26 - Notifications 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  notFoundError,
  forbiddenError,
  successResponse,
} from '@/lib/api-handler';

export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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

  const { id: notificationId } = params;

  // Verify notification exists and belongs to user
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    return notFoundError('Notification');
  }

  if (notification.userId !== user.id) {
    return forbiddenError('Not authorized to delete this notification');
  }

  // Delete notification
  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return successResponse({
    message: 'Notification deleted',
  });
});

