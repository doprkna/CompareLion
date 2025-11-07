import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/generation/history
 * Returns all past generations
 * Auth required
 * v0.29.17 - Generational Legacy System
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      currentGeneration: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get all generation records
  const generations = await prisma.generationRecord.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: {
          username: true,
          name: true,
        },
      },
    },
    orderBy: { generationNumber: 'asc' },
  });

  return successResponse({
    generations: generations.map((gen) => ({
      id: gen.id,
      generationNumber: gen.generationNumber,
      prestigeId: gen.prestigeId,
      inheritedPerks: gen.inheritedPerks,
      summaryText: gen.summaryText,
      createdAt: gen.createdAt,
    })),
    currentGeneration: user.currentGeneration,
    total: generations.length,
  });
});

