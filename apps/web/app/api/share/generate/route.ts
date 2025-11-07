import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { z } from 'zod';
import { generateShareCardImage } from '@/lib/services/shareCardService';

const GenerateShareSchema = z.object({
  type: z.enum(['weekly', 'achievement', 'comparison']),
});

const CARD_EXPIRY_HOURS = 48; // Cards expire after 48 hours

/**
 * POST /api/share/generate
 * Generates shareable image from user stats or reflection
 * Auth required
 * v0.29.15 - Share Cards
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
      xp: true,
      level: true,
      karmaScore: true,
      prestigeCount: true,
      seasonLevel: true,
      seasonXP: true,
      archetype: true,
      equippedTitle: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = GenerateShareSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { type } = parsed.data;

  // Get user stats based on type
  let stats: any = {};
  let caption: string | null = null;

  if (type === 'weekly') {
    // Get weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyXP = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        seasonalXP: true,
      },
    });

    const weeklyReflections = await prisma.userReflection.count({
      where: {
        userId: user.id,
        createdAt: { gte: weekAgo },
      },
    });

    stats = {
      weeklyXP: weeklyXP?.seasonalXP || 0,
      weeklyReflections,
      totalXP: user.xp || 0,
      level: user.level || 1,
    };

    // Generate caption template
    const xpGain = stats.weeklyXP;
    const xpFormatted = xpGain.toLocaleString();
    caption = `My Week in PareL — ${xpFormatted} XP earned, ${weeklyReflections} reflections.`;
  } else if (type === 'achievement') {
    // Get recent achievements
    const recentBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: {
        badge: true,
      },
      orderBy: { unlockedAt: 'desc' },
      take: 5,
    });

    stats = {
      prestigeCount: user.prestigeCount || 0,
      level: user.level || 1,
      karmaScore: user.karmaScore || 0,
      recentBadges: recentBadges.map((ub) => ({
        name: ub.badge.name,
        icon: ub.badge.icon,
      })),
    };

    caption = `My PareL Journey — Level ${stats.level}, Prestige ${stats.prestigeCount}, ${stats.karmaScore} Karma.`;
  } else if (type === 'comparison') {
    // Get comparison stats (vs global average)
    const globalAvgXP = await prisma.user.aggregate({
      _avg: {
        xp: true,
      },
    });

    stats = {
      userXP: user.xp || 0,
      globalAvgXP: Math.round(globalAvgXP._avg.xp || 0),
      level: user.level || 1,
      archetype: user.archetype || 'Unknown',
    };

    const archetypeName = stats.archetype || 'Reflective';
    caption = `This week's archetype mood: ${archetypeName} ${user.equippedTitle ? user.equippedTitle : ''}`;
  }

  // Generate share card image URL (using existing /api/share endpoint)
  const shareParams = new URLSearchParams({
    mode: 'stats',
    xp: String(stats.totalXP || stats.userXP || stats.weeklyXP || user.xp || 0),
    level: String(stats.level || user.level || 1),
    name: user.username || user.name || 'Player',
  });

  const imageUrl = `/api/share?${shareParams.toString()}`;

  // Create share card with expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CARD_EXPIRY_HOURS);

  const shareCard = await prisma.shareCard.create({
    data: {
      userId: user.id,
      type,
      imageUrl,
      caption,
      expiresAt,
    },
  });

  return successResponse({
    success: true,
    shareCard: {
      id: shareCard.id,
      type: shareCard.type,
      imageUrl: shareCard.imageUrl,
      caption: shareCard.caption,
      shareUrl: `/share/${shareCard.id}`,
      expiresAt: shareCard.expiresAt,
    },
    message: 'Share card generated successfully',
  });
});

