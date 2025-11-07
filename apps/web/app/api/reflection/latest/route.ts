/**
 * Latest Reflection API
 * v0.19.0 - Get user's most recent reflection
 * v0.22.5 - Add caching to reduce DB hits
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { cache } from '@/lib/cache';
import { safeAsync, successResponse, unauthorizedError, notFoundError } from '@/lib/api-handler';

/**
 * GET /api/reflection/latest
 * Get the user's most recent reflection (cached for 1 hour)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  
  // Cache key includes user ID and optional type
  const cacheKey = `reflection:latest:${user.id}${type ? `:${type}` : ''}`;

  // Check cache first
  const cached = cache.get<any>(cacheKey);
  if (cached) {
    return successResponse({
      reflection: cached,
      cached: true,
    });
  }

  // Build where clause
  const where: any = {
    userId: user.id,
  };

  if (type) {
    where.type = type;
  }

  // Fetch latest reflection
  const reflection = await prisma.userReflection.findFirst({
    where,
    orderBy: { date: 'desc' },
    select: {
      id: true,
      type: true,
      content: true,
      summary: true,
      sentiment: true,
      date: true,
      createdAt: true,
      stats: true,
    },
  });

  if (!reflection) {
    return notFoundError('No reflections found');
  }

  // Cache for 1 hour (3600 seconds)
  cache.set(cacheKey, reflection, 3600);

  return successResponse({
    reflection,
    cached: false,
  });
});

