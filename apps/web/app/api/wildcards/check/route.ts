import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { z } from 'zod';

const CheckWildcardSchema = z.object({
  triggerType: z.enum(['xpGain', 'login', 'reflection', 'random']),
});

const TRIGGER_CHANCE = 0.075; // 7.5% chance (5-10% range)
const MAX_WILDCARDS_PER_DAY = 3;

/**
 * POST /api/wildcards/check
 * Called after eligible actions → RNG trigger (5–10%)
 * Auth required
 * v0.29.13 - Wildcard Events
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
  const parsed = CheckWildcardSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { triggerType } = parsed.data;

  // Check daily limit (1-3 triggers per day max)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayWildcards = await prisma.userWildcardEvent.count({
    where: {
      userId: user.id,
      createdAt: { gte: today },
    },
  });

  if (todayWildcards >= MAX_WILDCARDS_PER_DAY) {
    return successResponse({
      triggered: false,
      message: 'Daily wildcard limit reached',
    });
  }

  // RNG trigger check (5-10% chance)
  const roll = Math.random();
  if (roll > TRIGGER_CHANCE) {
    return successResponse({
      triggered: false,
      message: 'No wildcard this time',
    });
  }

  // Find eligible wildcard events for this trigger type
  const eligibleWildcards = await prisma.wildcardEvent.findMany({
    where: {
      OR: [
        { triggerType },
        { triggerType: 'random' }, // Random type works for all triggers
      ],
    },
  });

  if (eligibleWildcards.length === 0) {
    return successResponse({
      triggered: false,
      message: 'No eligible wildcards',
    });
  }

  // Pick random wildcard
  const randomIndex = Math.floor(Math.random() * eligibleWildcards.length);
  const selectedWildcard = eligibleWildcards[randomIndex];

  // Create user wildcard event (not redeemed yet)
  const userWildcard = await prisma.userWildcardEvent.create({
    data: {
      userId: user.id,
      wildcardId: selectedWildcard.id,
      redeemed: false,
    },
    include: {
      wildcard: true,
    },
  });

  return successResponse({
    triggered: true,
    wildcard: {
      id: userWildcard.id,
      wildcardId: selectedWildcard.id,
      title: selectedWildcard.title,
      description: selectedWildcard.description,
      flavorText: selectedWildcard.flavorText,
      rewardXP: selectedWildcard.rewardXP,
      rewardKarma: selectedWildcard.rewardKarma,
    },
  });
});

