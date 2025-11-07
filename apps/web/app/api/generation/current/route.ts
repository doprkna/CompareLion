import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/generation/current
 * Returns active generation info + inherited perks
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
      prestigeCount: true,
      equippedTitle: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get current generation record (most recent)
  const currentGeneration = await prisma.generationRecord.findFirst({
    where: { userId: user.id },
    orderBy: { generationNumber: 'desc' },
  });

  // Calculate inherited perks from all past generations
  const allGenerations = await prisma.generationRecord.findMany({
    where: { userId: user.id },
    orderBy: { generationNumber: 'asc' },
  });

  // Aggregate all inherited perks
  const allInheritedPerks: any[] = [];
  allGenerations.forEach((gen) => {
    const perks = gen.inheritedPerks as any[];
    if (Array.isArray(perks)) {
      perks.forEach((perk) => {
        allInheritedPerks.push({
          ...perk,
          fromGeneration: gen.generationNumber,
        });
      });
    }
  });

  return successResponse({
    currentGeneration: user.currentGeneration,
    prestigeCount: user.prestigeCount,
    canAscend: user.prestigeCount >= 3,
    currentGenerationRecord: currentGeneration ? {
      id: currentGeneration.id,
      generationNumber: currentGeneration.generationNumber,
      inheritedPerks: currentGeneration.inheritedPerks,
      summaryText: currentGeneration.summaryText,
      createdAt: currentGeneration.createdAt,
    } : null,
    allInheritedPerks,
    totalGenerations: allGenerations.length,
  });
});

