/**
 * GET /api/rpg/status
 * RPG DLC gating status for current user (v0.46.01)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError } from '@/lib/api-handler';

const ELIGIBLE_LEVEL = 3;
const ELIGIBLE_ANSWERED_TODAY = 5;
const PROMPT_SEEN_COOLDOWN_DAYS = 7;
const DISMISS_COOLDOWN_DAYS = 1;

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      level: true,
      rpgEnabled: true,
      rpgPromptSeenAt: true,
      rpgDismissedAt: true,
      activeCharacterId: true,
      characters: { select: { id: true } },
    },
  });

  if (!user) return authError();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const answeredToday = await prisma.userQuestion.count({
    where: {
      userId: user.id,
      status: 'answered',
      updatedAt: { gte: todayStart },
    },
  });

  const eligible = (user.level ?? 1) >= ELIGIBLE_LEVEL && answeredToday >= ELIGIBLE_ANSWERED_TODAY;
  const hasCharacter = (user.characters?.length ?? 0) > 0;

  const now = new Date();
  const seenRecently = user.rpgPromptSeenAt
    ? (now.getTime() - user.rpgPromptSeenAt.getTime()) / (1000 * 60 * 60 * 24) < PROMPT_SEEN_COOLDOWN_DAYS
    : false;
  const dismissedRecently = user.rpgDismissedAt
    ? (now.getTime() - user.rpgDismissedAt.getTime()) / (1000 * 60 * 60 * 24) < DISMISS_COOLDOWN_DAYS
    : false;

  const shouldPromptCreate =
    eligible &&
    !hasCharacter &&
    !seenRecently &&
    !dismissedRecently;

  return NextResponse.json({
    success: true,
    data: {
      eligible,
      rpgEnabled: user.rpgEnabled ?? false,
      hasCharacter,
      activeCharacterId: user.activeCharacterId ?? null,
      shouldPromptCreate,
    },
  });
});
