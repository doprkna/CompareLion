import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getUserAchievements, getAchievementsByCategory } from '@/lib/services/achievementService';
import { safeAsync, unauthorizedError, successResponse, parseBody } from '@/lib/api-handler';

/**
 * GET /api/achievements
 * Returns all achievements with unlock status for current user
 * Query params: ?categories=true to get grouped by category
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  const categoriesParam = req.nextUrl.searchParams.get('categories');

  if (categoriesParam === 'true') {
    const grouped = await getAchievementsByCategory(user.id);
    return successResponse({ achievements: grouped });
  }

  const achievements = await getUserAchievements(user.id);
  return successResponse({ achievements });
});
