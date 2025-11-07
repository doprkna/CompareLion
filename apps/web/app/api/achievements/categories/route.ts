import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getAchievementsByCategory } from '@/lib/services/achievementService';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/achievements/categories
 * Returns achievements grouped by category
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

  const categories = await getAchievementsByCategory(user.id);
  return successResponse({ categories });
});

