/**
 * Rating History API
 * Get rating history for current user
 * v0.38.7 - Universal Rating Hub
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/rating/history?limit=20
 * Get rating history for current user
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
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50

  try {
    // Get rating requests with result status
    const requests = await prisma.ratingRequest.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        category: true,
        createdAt: true,
        result: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const history = requests.map((request) => ({
      id: request.id,
      category: request.category,
      createdAt: request.createdAt.toISOString(),
      hasResult: !!request.result,
    }));

    return successResponse({
      success: true,
      history,
      count: history.length,
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      history: [],
      count: 0,
      error: error.message || 'Failed to get rating history',
    });
  }
});

