/**
 * Random NPC API (v0.29.23)
 * 
 * GET /api/npc/random
 * Returns random active NPC matching user archetype or region
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      archetypeKey: true,
      region: true,
      level: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Find NPCs matching user archetype or available for all
  const where: any = {
    isActive: true,
    minLevel: { lte: user.level },
  };

  // If user has archetype, try to match it
  if (user.archetypeKey) {
    const archetypeMap: Record<string, string> = {
      warrior: 'guardian',
      thinker: 'thinker',
      trickster: 'trickster',
      charmer: 'wanderer',
      chaos: 'chaos',
    };

    const affinity = archetypeMap[user.archetypeKey] || null;
    if (affinity) {
      where.archetypeAffinity = affinity;
    }
  }

  // Get matching NPCs
  const matchingNPCs = await prisma.npcProfile.findMany({
    where,
    take: 20,
    orderBy: { appearanceRate: 'desc' },
    select: {
      id: true,
      npcId: true,
      name: true,
      title: true,
      avatar: true,
      archetypeAffinity: true,
      tone: true,
      bio: true,
      portraitUrl: true,
      appearanceRate: true,
    },
  });

  if (matchingNPCs.length === 0) {
    // Fallback to any active NPC
    const fallbackNPCs = await prisma.npcProfile.findMany({
      where: { isActive: true },
      take: 10,
      select: {
        id: true,
        npcId: true,
        name: true,
        title: true,
        avatar: true,
        archetypeAffinity: true,
        tone: true,
        bio: true,
        portraitUrl: true,
        appearanceRate: true,
      },
    });

    if (fallbackNPCs.length === 0) {
      return successResponse({
        npc: null,
        message: 'No NPCs available',
      });
    }

    // Return random fallback NPC
    const randomNPC = fallbackNPCs[Math.floor(Math.random() * fallbackNPCs.length)];
    return successResponse({ npc: randomNPC });
  }

  // Weight by appearanceRate and return random
  const totalWeight = matchingNPCs.reduce((sum, npc) => sum + (npc.appearanceRate || 1), 0);
  let random = Math.random() * totalWeight;

  for (const npc of matchingNPCs) {
    random -= npc.appearanceRate || 1;
    if (random <= 0) {
      return successResponse({ npc });
    }
  }

  // Fallback to first NPC
  return successResponse({ npc: matchingNPCs[0] });
});

