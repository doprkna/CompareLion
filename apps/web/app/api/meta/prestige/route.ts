import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { grantPrestigeBadge, getPrestigeTitle } from '@/lib/services/prestigeService';

const PRESTIGE_LEVEL_CAP = 50; // Level required for prestige
const PRESTIGE_XP_GAIN_BONUS = 0.01; // +1% XP gain per prestige

/**
 * POST /api/meta/prestige
 * Resets XP/level, records PrestigeRecord, grants badge/title
 * Auth required, irreversible action
 * v0.29.9 - Meta-Progression Layer
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
      seasonLevel: true,
      seasonXP: true,
      prestigeCount: true,
      xp: true,
      level: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Check if user can prestige (must be at level cap)
  if (user.seasonLevel < PRESTIGE_LEVEL_CAP) {
    return validationError(`Must reach level ${PRESTIGE_LEVEL_CAP} to prestige`);
  }

  // Get current active season
  const currentSeason = await prisma.metaSeason.findFirst({
    where: { isActive: true },
    orderBy: { startDate: 'desc' },
  });

  if (!currentSeason) {
    return validationError('No active season found');
  }

  // Check if already prestiged in this season
  const existingPrestige = await prisma.prestigeRecord.findFirst({
    where: {
      userId: user.id,
      seasonId: currentSeason.id,
    },
  });

  if (existingPrestige) {
    return validationError('Already prestiged in this season');
  }

  // Calculate legacy XP (total XP ever earned)
  const legacyXP = (user.xp || 0) + (user.seasonXP || 0);
  const newPrestigeCount = user.prestigeCount + 1;

  // Grant badge and get title
  const { badgeId, badgeKey } = await grantPrestigeBadge(user.id, newPrestigeCount);
  const title = getPrestigeTitle(newPrestigeCount);

  // Perform prestige in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create prestige record with badge ID
    const prestigeRecord = await tx.prestigeRecord.create({
      data: {
        userId: user.id,
        seasonId: currentSeason.id,
        oldLevel: user.seasonLevel,
        legacyXP,
        prestigeCount: newPrestigeCount,
        rewardBadgeId: badgeId || undefined,
      },
    });

    // Update user: reset season progress, update prestige count, and optionally set title
    const updateData: any = {
      seasonLevel: 1,
      seasonXP: 0,
      prestigeCount: newPrestigeCount,
    };

    // Set title if one is awarded (replace if higher tier)
    if (title) {
      updateData.equippedTitle = title;
    }

    await tx.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Log transaction for rewards tracking
    await tx.transaction.create({
      data: {
        userId: user.id,
        type: 'reward',
        amount: 0, // Prestige doesn't grant currency directly
        currencyKey: 'xp',
        note: `Prestige #${newPrestigeCount} - Legacy XP: ${legacyXP}${badgeId ? ` - Badge: ${badgeKey}` : ''}${title ? ` - Title: ${title}` : ''}`,
      },
    });

    return { prestigeRecord, badgeId, title };
  });

  return successResponse({
    success: true,
    prestigeRecord: {
      id: result.prestigeRecord.id,
      prestigeCount: newPrestigeCount,
      legacyXP,
      oldLevel: user.seasonLevel,
      badgeId: result.badgeId,
      badgeKey,
      title: result.title,
    },
    message: `🏆 Prestige achieved — ${result.badgeId ? 'new badge' : ''}${result.badgeId && result.title ? ' and ' : ''}${result.title ? 'new title' : ''} unlocked! (Prestige ${newPrestigeCount})`,
  });
});

