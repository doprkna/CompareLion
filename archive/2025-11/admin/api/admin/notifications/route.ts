/**
 * Admin Notifications Management API
 * GET /api/admin/notifications - List all notifications with filters
 * POST /api/admin/notifications - Send manual system notification
 * v0.36.26 - Notifications 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  forbiddenError,
  validationError,
  successResponse,
} from '@/lib/api-handler';
import { UserRole } from '@parel/db/client';
import { z } from 'zod';
import { notifySystemMessage } from '@/lib/services/notificationService';

const SendNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
});

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    return forbiddenError('Admin access required');
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const where: any = {};
  if (type) {
    where.type = type;
  }
  if (userId) {
    where.userId = userId;
  }

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return successResponse({ notifications });
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    return forbiddenError('Admin access required');
  }

  const body = await req.json();
  const parsed = SendNotificationSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid notification data', parsed.error.issues);
  }

  const { userId, title, body } = parsed.data;

  // Verify user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return validationError('User not found');
  }

  // Send system notification
  await notifySystemMessage(userId, body || title);

  return successResponse({
    message: 'Notification sent successfully',
  });
});

