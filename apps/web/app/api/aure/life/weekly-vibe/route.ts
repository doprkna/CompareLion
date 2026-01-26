/**
 * AURE Life Engine - Weekly Vibe API
 * Get weekly vibe summary
 * v0.39.1 - AURE Life Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { generateWeeklyVibe } from '@/lib/aure/life/weeklyVibeService';

/**
 * GET /api/aure/life/weekly-vibe
 * Get weekly vibe summary
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

  try {
    const vibe = await generateWeeklyVibe(user.id);

    return successResponse({
      summary: vibe.summary,
      categoryDistribution: vibe.categoryDistribution,
      avgScore: vibe.avgScore,
      vibeChange: vibe.vibeChange,
      generatedAt: vibe.generatedAt.toISOString(),
    });
  } catch (error: any) {
    return successResponse({
      summary: 'Your weekly vibe is being analyzed. Check back soon!',
      categoryDistribution: {},
      avgScore: 0,
      vibeChange: null,
      generatedAt: new Date().toISOString(),
      error: error.message || 'Failed to generate weekly vibe',
    });
  }
});

