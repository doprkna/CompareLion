/**
 * NPC Interaction API (v0.29.23)
 * 
 * POST /api/npc/interact
 * Logs short interaction (for possible future lore links)
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const InteractSchema = z.object({
  npcId: z.string().min(1),
  triggerType: z.enum(['greeting', 'quest', 'reflection', 'event', 'random']).optional(),
  userResponse: z.string().optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      archetypeKey: true,
      karmaScore: true,
      level: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Check rate limit (3 per hour)
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const recentInteractions = await prisma.npcInteraction.count({
    where: {
      userId: user.id,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (recentInteractions >= 3) {
    return validationError('Interaction limit reached (3 per hour)');
  }

  const body = await req.json().catch(() => ({}));
  const validation = InteractSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { npcId, triggerType = 'random', userResponse } = validation.data;

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
    return validationError('NPC not found');
  }

  // Get dialogue
  // Note: Prisma generates NPCDialogue as nPCDialogue in client
  const dialogue = await (prisma as any).nPCDialogue.findFirst({
    where: {
      npcId: npc.id,
      triggerType: triggerType as any,
    },
    orderBy: { rarity: 'desc' },
  });

  const dialogueText = dialogue?.text || `${npc.name}: "Hello, traveler."`;

  // Get or create affinity
  const affinity = await (prisma as any).npcAffinity.upsert({
    where: {
      userId_npcId: {
        userId: user.id,
        npcId: npc.id,
      },
    },
    create: {
      userId: user.id,
      npcId: npc.id,
      lastInteraction: new Date(),
      affinityScore: 5.0, // Initial affinity on first interaction
    },
    update: {
      lastInteraction: new Date(),
      affinityScore: { increment: 5.0 }, // +5 affinity per interaction
    },
    select: {
      id: true,
      affinityScore: true,
    },
  });

  // Cap affinity at 100
  let finalAffinity = Math.min(100, affinity.affinityScore);
  if (finalAffinity !== affinity.affinityScore) {
    await (prisma as any).npcAffinity.update({
      where: { id: affinity.id },
      data: { affinityScore: finalAffinity },
    });
  }

  // Store memory of last dialogue
  await (prisma as any).npcMemory.upsert({
    where: {
      npcId_userId_key: {
        npcId: npc.id,
        userId: user.id,
        key: 'lastDialogue',
      },
    },
    create: {
      npcId: npc.id,
      userId: user.id,
      memoryType: 'dialogue',
      key: 'lastDialogue',
      value: {
        text: dialogueText,
        triggerType,
        timestamp: new Date().toISOString(),
      },
      importance: 2,
    },
    update: {
      value: {
        text: dialogueText,
        triggerType,
        timestamp: new Date().toISOString(),
      },
      lastAccessed: new Date(),
      accessCount: { increment: 1 },
    },
  });

  // Log interaction
  const interaction = await prisma.npcInteraction.create({
    data: {
      npcId: npc.id,
      userId: user.id,
      interactionType: triggerType,
      userArchetype: user.archetypeKey || null,
      userKarma: user.karmaScore || null,
      npcMessage: dialogueText,
      userResponse: userResponse || null,
    },
  });

  // Grant small rewards (optional - based on NPC type)
  let rewardXP = 0;
  let rewardKarma = 0;

  // Thinker NPCs give reflection XP
  if (npc.tone === 'serious' || triggerType === 'reflection') {
    rewardXP = 5;
  }

  // Guardian NPCs give karma
  if (triggerType === 'greeting') {
    rewardKarma = 1;
  }

  // Higher affinity = bonus rewards
  if (finalAffinity >= 60) {
    rewardXP = Math.floor(rewardXP * 1.5); // 50% bonus
    rewardKarma = Math.floor(rewardKarma * 1.5);
  }

  if (rewardXP > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: rewardXP } },
    });
  }

  if (rewardKarma > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { karmaScore: { increment: rewardKarma } },
    });
  }

  // Determine affinity tone
  let affinityTone = 'distant';
  if (finalAffinity >= 60) {
    affinityTone = 'mentor/friend';
  } else if (finalAffinity >= 20) {
    affinityTone = 'familiar';
  }

  return successResponse({
    interaction: {
      id: interaction.id,
      npcMessage: dialogueText,
      rewardXP,
      rewardKarma,
      affinityScore: finalAffinity,
      affinityTone,
    },
    message: rewardXP > 0 || rewardKarma > 0
      ? `Interaction logged. Affinity: ${finalAffinity.toFixed(1)}. Rewards: ${rewardXP > 0 ? `+${rewardXP} XP` : ''} ${rewardKarma > 0 ? `+${rewardKarma} Karma` : ''}`
      : `Interaction logged. Affinity: ${finalAffinity.toFixed(1)}`,
  });
});

