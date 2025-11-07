/**
 * NPC Memory API (v0.29.29)
 * 
 * GET /api/npc/memory
 * Returns last dialogue + affinity hints
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
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
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { searchParams } = new URL(req.url);
  const npcId = searchParams.get('npcId');

  if (!npcId) {
    return validationError('npcId is required');
  }

  // Get NPC
  const npc = await prisma.npcProfile.findUnique({
    where: { id: npcId },
    select: {
      id: true,
      name: true,
      tone: true,
    },
  });

  if (!npc) {
    return notFoundError('NPC not found');
  }

  // Get affinity
  const affinity = await (prisma as any).npcAffinity.findUnique({
    where: {
      userId_npcId: {
        userId: user.id,
        npcId: npc.id,
      },
    },
    select: {
      id: true,
      affinityScore: true,
      lastInteraction: true,
      note: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Get last dialogue from memory
  const lastDialogue = await (prisma as any).npcMemory.findUnique({
    where: {
      npcId_userId_key: {
        npcId: npc.id,
        userId: user.id,
        key: 'lastDialogue',
      },
    },
    select: {
      value: true,
      lastAccessed: true,
    },
  });

  // Get recent interactions (last 5)
  const recentInteractions = await prisma.npcInteraction.findMany({
    where: {
      userId: user.id,
      npcId: npc.id,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      interactionType: true,
      npcMessage: true,
      userResponse: true,
      createdAt: true,
    },
  });

  // Determine affinity tone
  let affinityTone = 'distant';
  let affinityHint = 'The NPC seems distant.';
  const affinityScore = affinity?.affinityScore || 0;

  if (affinityScore >= 60) {
    affinityTone = 'mentor/friend';
    affinityHint = 'You have a strong bond with this NPC. They trust you.';
  } else if (affinityScore >= 20) {
    affinityTone = 'familiar';
    affinityHint = 'The NPC recognizes you and is comfortable around you.';
  } else {
    affinityHint = 'The NPC is still getting to know you.';
  }

  return successResponse({
    npc: {
      id: npc.id,
      name: npc.name,
      tone: npc.tone,
    },
    affinity: affinity ? {
      score: affinityScore,
      tone: affinityTone,
      hint: affinityHint,
      lastInteraction: affinity.lastInteraction,
      note: affinity.note,
      createdAt: affinity.createdAt,
      updatedAt: affinity.updatedAt,
    } : null,
    lastDialogue: lastDialogue ? {
      text: (lastDialogue.value as any)?.text || null,
      triggerType: (lastDialogue.value as any)?.triggerType || null,
      timestamp: (lastDialogue.value as any)?.timestamp || null,
      lastAccessed: lastDialogue.lastAccessed,
    } : null,
    recentInteractions: recentInteractions.map(i => ({
      id: i.id,
      interactionType: i.interactionType,
      npcMessage: i.npcMessage,
      userResponse: i.userResponse,
      createdAt: i.createdAt,
    })),
  });
});

