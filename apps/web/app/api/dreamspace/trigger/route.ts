import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { z } from 'zod';

const TriggerDreamSchema = z.object({
  triggerType: z.enum(['sleep', 'reflection', 'random']).optional(),
});

const TRIGGER_CHANCE = 0.02; // 2% chance (1-3% range)

/**
 * POST /api/dreamspace/trigger
 * Chance-based entry to Dreamspace (1–3% on reflection)
 * Auth required
 * v0.29.16 - Dreamspace
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = TriggerDreamSchema.safeParse(body);
  if (!parsed.success) {
    return successResponse({
      triggered: false,
      message: 'Invalid payload',
    });
  }

  const { triggerType = 'random' } = parsed.data;

  // Get global mood for dream tone sync
  const globalMood = await prisma.globalMood.findFirst({
    orderBy: { updatedAt: 'desc' },
    select: {
      dominantEmotion: true,
    },
  });

  const dominantEmotion = globalMood?.dominantEmotion || 'calm';
  
  // Map emotion to flavor tone
  const emotionToTone: Record<string, string> = {
    calm: 'calm',
    joy: 'calm',
    hope: 'calm',
    sad: 'chaotic',
    anger: 'chaotic',
    chaos: 'chaotic',
  };
  const flavorTone = emotionToTone[dominantEmotion] || 'mystic';

  // RNG trigger check (1-3% chance)
  const roll = Math.random();
  if (roll > TRIGGER_CHANCE) {
    return successResponse({
      triggered: false,
      message: 'No dream this time',
    });
  }

  // Find eligible dream events for this trigger type and flavor tone
  const eligibleDreams = await prisma.dreamEvent.findMany({
    where: {
      isActive: true,
      OR: [
        { triggerType },
        { triggerType: 'random' },
      ],
      OR: [
        { flavorTone },
        { flavorTone: 'mystic' }, // Mystic dreams can appear for any tone
      ],
    },
    take: 10, // Limit for randomness
  });

  if (eligibleDreams.length === 0) {
    return successResponse({
      triggered: false,
      message: 'No eligible dreams',
    });
  }

  // Pick random dream
  const randomIndex = Math.floor(Math.random() * eligibleDreams.length);
  const selectedDream = eligibleDreams[randomIndex];

  // Create user dream event (not resolved yet)
  const userDream = await prisma.userDreamEvent.create({
    data: {
      userId: user.id,
      dreamId: selectedDream.id,
      resolved: false,
    },
    include: {
      dream: true,
    },
  });

  return successResponse({
    triggered: true,
    dream: {
      id: userDream.id,
      dreamId: selectedDream.id,
      title: selectedDream.title,
      description: selectedDream.description,
      flavorTone: selectedDream.flavorTone,
      effect: selectedDream.effect,
    },
  });
});

