/**
 * Chronicle Latest API
 * GET /api/chronicle/latest - Get the latest chronicle entry
 * v0.36.43 - World Chronicle 2.0
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, notFoundError } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * GET /api/chronicle/latest
 * Returns the most recent chronicle entry
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const chronicle = await prisma.chronicleEntry.findFirst({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      season: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!chronicle) {
    return notFoundError('No chronicle entries found');
  }

  return successResponse({
    chronicle: {
      id: chronicle.id,
      seasonId: chronicle.seasonId,
      weekNumber: chronicle.weekNumber,
      summaryJSON: chronicle.summaryJSON,
      aiStory: chronicle.aiStory,
      createdAt: chronicle.createdAt.toISOString(),
      season: chronicle.season,
    },
  });
});

