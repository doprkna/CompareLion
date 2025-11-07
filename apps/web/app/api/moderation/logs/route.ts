import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError } from '@/lib/api-handler';
import { getAdminStatus } from '@/lib/adminAuth';

/**
 * GET /api/moderation/logs
 * Get moderation action history - admin only
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  // Check admin status
  const isAdminUser = await getAdminStatus(user.userId, user.email);
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const action = searchParams.get('action'); // Filter by action type

  // Fetch moderation logs
  const logs = await prisma.moderationLog.findMany({
    where: action ? { action } : undefined,
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 100),
    include: {
      moderator: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Format logs
  const formattedLogs = logs.map((log) => ({
    id: log.id,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    reason: log.reason,
    createdAt: log.createdAt,
    moderator: log.moderator.username || log.moderator.name || log.moderator.email,
    moderatorId: log.moderator.id,
  }));

  return NextResponse.json({
    success: true,
    logs: formattedLogs,
    count: formattedLogs.length,
  });
});

