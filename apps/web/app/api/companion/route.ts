/**
 * Companion API
 * v0.36.17 - Companions + Pets System v0.1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse, parseBody } from '@/lib/api-handler';
import { equipCompanion, unequipCompanion, getEquippedCompanionBonuses } from '@/lib/rpg/companion';
import { computeHeroStats } from '@/lib/rpg/stats';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/companion
 * Get user's companions
 */
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

  const userCompanions = await prisma.userCompanion.findMany({
    where: { userId: user.id },
    include: {
      companion: true,
    },
    orderBy: {
      equipped: 'desc',
    },
  });

  return successResponse({
    companions: userCompanions.map(uc => ({
      id: uc.id,
      companionId: uc.companionId,
      name: uc.companion.name,
      type: uc.companion.type,
      rarity: uc.companion.rarity,
      icon: uc.companion.icon,
      level: uc.level,
      xp: uc.xp,
      equipped: uc.equipped,
      bonuses: {
        atk: uc.companion.atkBonus,
        def: uc.companion.defBonus,
        hp: uc.companion.hpBonus,
        crit: uc.companion.critBonus,
        speed: uc.companion.speedBonus,
        xp: uc.companion.xpBonus,
        gold: uc.companion.goldBonus,
      },
    })),
  });
});

/**
 * POST /api/companion/equip
 * Equip a companion
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const body = await parseBody<{ userCompanionId: string }>(req);

  if (!body.userCompanionId) {
    return unauthorizedError('Missing userCompanionId');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  try {
    await equipCompanion(user.id, body.userCompanionId);
    
    // Return updated hero stats
    const heroStats = await computeHeroStats(user.id);
    
    return successResponse({
      success: true,
      heroStats,
    });
  } catch (error) {
    return unauthorizedError(
      error instanceof Error ? error.message : 'Failed to equip companion'
    );
  }
}


