import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { grantPrestigeBadge, getPrestigeTitle, getPrestigeColorTheme } from '@/lib/services/prestigeService';

const PRESTIGE_LEVEL_CAP = 50;

/**
 * POST /api/prestige/activate
 * Triggers prestige reset and badge grant
 * Auth required, irreversible action
 * v0.29.14 - Prestige System Expansion
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

  // Grant badge and get title/color theme
  const { badgeId, badgeKey } = await grantPrestigeBadge(user.id, newPrestigeCount);
  const title = getPrestigeTitle(newPrestigeCount);
  const colorTheme = getPrestigeColorTheme(newPrestigeCount);

  // Perform prestige in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create prestige record with all prestige info
    const prestigeRecord = await tx.prestigeRecord.create({
      data: {
        userId: user.id,
        seasonId: currentSeason.id,
        oldLevel: user.seasonLevel,
        legacyXP,
        prestigeCount: newPrestigeCount,
        rewardBadgeId: badgeId || undefined,
        prestigeTitle: title || undefined,
        prestigeBadgeId: badgeId || undefined,
        prestigeColorTheme: colorTheme || undefined,
      },
    });

    // Update user: reset season progress, update prestige count, and set prestige rewards
    const updateData: any = {
      seasonLevel: 1,
      seasonXP: 0,
      prestigeCount: newPrestigeCount,
    };

    // Set prestige title, badge, and color theme
    if (title) {
      updateData.prestigeTitle = title;
      updateData.equippedTitle = title; // Also set as equipped title
    }
    if (badgeId) {
      updateData.prestigeBadgeId = badgeId;
    }
    if (colorTheme) {
      updateData.prestigeColorTheme = colorTheme;
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
        amount: 0,
        currencyKey: 'xp',
        note: `Prestige #${newPrestigeCount} - Legacy XP: ${legacyXP}${badgeId ? ` - Badge: ${badgeKey}` : ''}${title ? ` - Title: ${title}` : ''}${colorTheme ? ` - Theme: ${colorTheme}` : ''}`,
      },
    });

    return { prestigeRecord, badgeId, badgeKey, title, colorTheme };
  });

  return successResponse({
    success: true,
    prestigeRecord: {
      id: result.prestigeRecord.id,
      prestigeCount: newPrestigeCount,
      legacyXP,
      oldLevel: user.seasonLevel,
      badgeId: result.badgeId,
      badgeKey: result.badgeKey,
      title: result.title,
      colorTheme: result.colorTheme,
    },
    message: `🏆 Prestige achieved — ${result.badgeId ? 'new badge' : ''}${result.badgeId && result.title ? ' and ' : ''}${result.title ? 'new title' : ''} unlocked! (Prestige ${newPrestigeCount})`,
  });
});

