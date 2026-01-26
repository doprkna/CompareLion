import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getUserAchievements, getAchievementsByCategory } from '@/lib/services/achievementService';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import type { AchievementDTO, AchievementsResponseDTO } from '@parel/types/dto';

/**
 * GET /api/achievements
 * Returns all achievements with unlock status for current user
 * Query params: ?categories=true to get grouped by category
 * v0.41.4 - C3 Step 5: Unified API envelope
 * v0.41.9 - C3 Step 10: DTO Consolidation Batch #2
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

  const categoriesParam = req.nextUrl.searchParams.get('categories');

  if (categoriesParam === 'true') {
    const grouped = await getAchievementsByCategory(user.id);
    const response: AchievementsResponseDTO = { achievements: grouped };
    return buildSuccess(req, response);
  }

  const achievements = await getUserAchievements(user.id);
  const response: AchievementsResponseDTO = { achievements };
  return buildSuccess(req, response);
});
