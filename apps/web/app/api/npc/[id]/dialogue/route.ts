/**
 * NPC Dialogue API (v0.29.23)
 * 
 * GET /api/npc/[id]/dialogue
 * Returns next dialogue line filtered by tone & triggerType
 */

import { NextRequest } from 'next/server';
import { safeAsync, notFoundError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const npcId = params.id;
  const { searchParams } = new URL(req.url);
  const triggerType = searchParams.get('trigger') || 'greeting';
  const tone = searchParams.get('tone');

  // Verify NPC exists
  const npc = await prisma.npcProfile.findUnique({
    where: { id: npcId },
    select: {
      id: true,
      tone: true,
      isActive: true,
    },
  });

  if (!npc || !npc.isActive) {
    return notFoundError('NPC not found or inactive');
  }

  // Build query for dialogues
  const where: any = {
    npcId: npc.id,
    triggerType: triggerType as any,
  };

  // If tone specified, prefer matching tone, but allow any
  // Note: Prisma generates NPCDialogue as nPCDialogue in client
  const dialogues = await (prisma as any).nPCDialogue.findMany({
    where,
    orderBy: [
      ...(tone && tone === npc.tone ? [{ rarity: 'desc' }] : []),
      { rarity: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 10,
  });

  if (dialogues.length === 0) {
    // Fallback to any dialogue for this NPC
    const fallbackDialogues = await (prisma as any).nPCDialogue.findMany({
      where: { npcId: npc.id },
      orderBy: { rarity: 'desc' },
      take: 5,
    });

    if (fallbackDialogues.length === 0) {
      return successResponse({
        dialogue: null,
        message: 'No dialogue available for this NPC',
      });
    }

    // Return random fallback
    const randomDialogue = fallbackDialogues[Math.floor(Math.random() * fallbackDialogues.length)];
    return successResponse({ dialogue: randomDialogue });
  }

  // Weight by rarity and return random
  const rarityWeights: Record<string, number> = {
    epic: 3,
    rare: 2,
    common: 1,
  };

  const weightedDialogues: Array<{ dialogue: typeof dialogues[0]; weight: number }> = [];
  for (const dialogue of dialogues) {
    const weight = rarityWeights[dialogue.rarity] || 1;
    for (let i = 0; i < weight; i++) {
      weightedDialogues.push({ dialogue, weight });
    }
  }

  const randomDialogue = weightedDialogues[Math.floor(Math.random() * weightedDialogues.length)];

  return successResponse({ dialogue: randomDialogue.dialogue });
});

