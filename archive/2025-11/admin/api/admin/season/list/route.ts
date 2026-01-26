/**
 * Admin Season List API
 * v0.36.23 - Season Pass System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * GET /api/admin/season/list
 * List all seasons
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return unauthorizedError('Admin access required');
  }

  try {
    const seasons = await prisma.season.findMany({
      orderBy: { seasonNumber: 'desc' },
      select: {
        id: true,
        name: true,
        seasonNumber: true,
        startsAt: true,
        endsAt: true,
        isActive: true,
      },
    });

    return successResponse({
      seasons: seasons.map(s => ({
        ...s,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
      })),
    });
  } catch (error) {
    // Season model may not exist yet
    return successResponse({
      seasons: [],
      note: 'Season model not found - schema migration may be needed',
    });
  }
});


