import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

/**
 * POST /api/notifications/read
 * Mark notifications as read
 * Body: { ids?: string[], all?: boolean }
 */

const MarkReadSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  const body = await req.json();
  const parsed = MarkReadSchema.safeParse(body);
  
  if (!parsed.success) {
    return validationError('Invalid request', parsed.error.issues);
  }

  const { ids, all } = parsed.data;

  if (!ids && !all) {
    return validationError('Must provide either ids array or all=true');
  }

  // Mark all notifications as read
  if (all) {
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      markedCount: result.count,
      message: 'All notifications marked as read',
    });
  }

  // Mark specific notifications as read
  if (ids && ids.length > 0) {
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.userId,
        id: { in: ids },
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      markedCount: result.count,
      message: `${result.count} notification(s) marked as read`,
    });
  }

  return validationError('No notifications to mark');
});

