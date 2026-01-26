/**
 * AURE Life Engine - Yearly Wrap API
 * Get yearly wrap data
 * v0.39.4 - AURE Yearly Wrap
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { generateYearlyWrap } from '@/lib/aure/life/yearlyWrapService';

/**
 * GET /api/aure/life/yearly-wrap?year=2025
 * Get yearly wrap data
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

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (isNaN(year) || year < 2020 || year > 2100) {
    return validationError('Invalid year');
  }

  try {
    const wrap = await generateYearlyWrap(user.id, year);

    return successResponse({
      timelineStats: wrap.timelineStats,
      categoryBreakdown: wrap.categoryBreakdown,
      archetypeHistory: wrap.archetypeHistory,
      topItems: wrap.topItems,
      worstItems: wrap.worstItems,
      vibeStory: wrap.vibeStory,
      recommendation: wrap.recommendation,
      shareableId: wrap.shareableId,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate yearly wrap');
  }
});

