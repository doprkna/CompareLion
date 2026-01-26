/**
 * Chronicle Season API
 * GET /api/chronicle/season/:id - Get chronicle entries for a season
 * v0.36.43 - World Chronicle 2.0
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * GET /api/chronicle/season/:id
 * Returns all chronicle entries for a specific season
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const seasonId = params.id;

  const chronicles = await prisma.chronicleEntry.findMany({
    where: {
      seasonId,
    },
    orderBy: {
      weekNumber: 'desc',
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

  return successResponse({
    chronicles: chronicles.map(chronicle => ({
      id: chronicle.id,
      seasonId: chronicle.seasonId,
      weekNumber: chronicle.weekNumber,
      summaryJSON: chronicle.summaryJSON,
      aiStory: chronicle.aiStory,
      createdAt: chronicle.createdAt.toISOString(),
      season: chronicle.season,
    })),
    totalChronicles: chronicles.length,
  });
});

