import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError } from '@/lib/api-handler';

/**
 * GET /api/activity/recent
 * Returns last 10 user activities
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  // Fetch recent activities (last 10)
  const activities = await prisma.activity.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      metadata: true,
      createdAt: true,
    },
  });

  // Parse metadata if it's a JSON string
  const parsedActivities = activities.map((activity) => ({
    ...activity,
    metadata: activity.metadata
      ? typeof activity.metadata === 'string'
        ? (() => { try { return JSON.parse(activity.metadata); } catch { return null; } })() // sanity-fix
        : activity.metadata
      : null,
  }));

  return NextResponse.json({
    success: true,
    activities: parsedActivities,
    count: parsedActivities.length,
  });
});

