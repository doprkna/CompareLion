import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { z } from 'zod';

const AscendSchema = z.object({
  inheritedPerks: z.array(z.object({
    type: z.string(),
    value: z.union([z.string(), z.number()]),
  })).min(1).max(2), // 1-2 inherited perks
});

const PRESTIGE_THRESHOLD = 3; // Prestige ≥3 required for ascension

/**
 * POST /api/generation/ascend
 * Archives current progress, creates new generation record
 * Auth required
 * v0.29.17 - Generational Legacy System
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
      username: true,
      name: true,
      prestigeCount: true,
      currentGeneration: true,
      xp: true,
      level: true,
      karmaScore: true,
      archetype: true,
      equippedTitle: true,
      prestigeTitle: true,
      prestigeBadgeId: true,
      prestigeColorTheme: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Check if user can ascend (must have Prestige ≥3)
  if (user.prestigeCount < PRESTIGE_THRESHOLD) {
    return validationError(`Must reach Prestige ${PRESTIGE_THRESHOLD} to ascend`);
  }

  const body = await req.json().catch(() => ({}));
  const parsed = AscendSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { inheritedPerks } = parsed.data;

  // Get current badges summary
  const currentBadges = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: {
      badge: {
        select: {
          name: true,
          icon: true,
          rarity: true,
        },
      },
    },
    take: 10,
  });

  // Get most recent prestige record
  const latestPrestige = await prisma.prestigeRecord.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Generate summary text from Lore Engine (placeholder)
  const summaryText = `The echoes of ${user.username || user.name || 'their'} past selves whisper through the new dawn. Generation ${user.currentGeneration} ascends to Generation ${user.currentGeneration + 1}, carrying forward ${inheritedPerks.length} inherited ${inheritedPerks.length === 1 ? 'perk' : 'perks'}.`;

  // Perform ascension in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create generation record
    const generationRecord = await tx.generationRecord.create({
      data: {
        userId: user.id,
        generationNumber: user.currentGeneration,
        prestigeId: latestPrestige?.id || undefined,
        inheritedPerks: inheritedPerks,
        summaryText,
      },
    });

    // Increment current generation
    await tx.user.update({
      where: { id: user.id },
      data: {
        currentGeneration: user.currentGeneration + 1,
      },
    });

    // Apply inherited perks
    for (const perk of inheritedPerks) {
      if (perk.type === 'xpBoost') {
        // XP boost is passive and applied during XP gain calculations
        // Just log it here
      } else if (perk.type === 'title' && typeof perk.value === 'string') {
        // Set title as equipped title
        await tx.user.update({
          where: { id: user.id },
          data: {
            equippedTitle: perk.value,
          },
        });
      }
      // Other perk types can be handled here
    }

    return { generationRecord };
  });

  return successResponse({
    success: true,
    generation: {
      id: result.generationRecord.id,
      generationNumber: user.currentGeneration,
      newGeneration: user.currentGeneration + 1,
      inheritedPerks,
      summaryText,
    },
    message: `🌟 Generation ${user.currentGeneration} ascended to Generation ${user.currentGeneration + 1}!`,
  });
});

