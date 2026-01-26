/**
 * Event Effects API
 * GET /api/events/effects - Get resolved event effects for current user
 * v0.36.41 - Events System 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { resolveEventEffects, getActiveEventsWithEffects } from '@/lib/events/effectResolver';

export const runtime = 'nodejs';

/**
 * GET /api/events/effects
 * Returns resolved event effects (combined effects from all active events)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  let userId: string | undefined;

  // Get user ID if authenticated
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) {
      userId = user.id;
    }
  }

  const { events, resolvedEffects } = await getActiveEventsWithEffects(userId);

  return successResponse({
    events: events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      type: event.type,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      icon: event.icon,
      emoji: event.emoji,
      effects: event.effects.map(effect => ({
        id: effect.id,
        effectType: effect.effectType,
        value: effect.value,
        target: effect.target,
        description: effect.description,
      })),
    })),
    resolvedEffects: {
      xpMultiplier: resolvedEffects.xpMultiplier,
      goldMultiplier: resolvedEffects.goldMultiplier,
      dropBoost: resolvedEffects.dropBoost,
      damageBuff: resolvedEffects.damageBuff,
      damageNerf: resolvedEffects.damageNerf,
      challengeBonus: resolvedEffects.challengeBonus,
    },
  });
});

