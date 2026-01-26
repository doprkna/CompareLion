/**
 * Admin Season Create API
 * v0.36.23 - Season Pass System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { seedSeason } from '@/lib/season/seed';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * POST /api/admin/season/create
 * Create a new season with seeded tiers
 */
export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await req.json().catch(() => ({}));
  const { seasonNumber } = body;

  if (!seasonNumber || typeof seasonNumber !== 'number') {
    return validationError('seasonNumber is required and must be a number');
  }

  try {
    const seasonId = await seedSeason(seasonNumber);
    return successResponse({
      success: true,
      seasonId,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to create season');
  }
});


