/**
 * Poster Generate API (v0.29.28)
 * 
 * POST /api/posters/generate
 * Creates poster image using same renderer as ShareCards
 * 1 free poster/day; premium users unlimited
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateShareCardImage } from '@/lib/services/shareCardService';

const GeneratePosterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  rarity: z.enum(['gold', 'silver', 'bronze']).optional(),
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
      username: true,
      name: true,
      xp: true,
      level: true,
      archetype: true,
      archetypeKey: true,
      streakCount: true,
      role: true,
      userStats: {
        select: {
          totalXP: true,
          totalKarma: true,
          questionsCount: true,
          streakDays: true,
        },
      },
      reflections: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      },
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const validation = GeneratePosterSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { title, rarity } = validation.data;

  // Check daily limit (1 free poster/day; premium users unlimited)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPosters = await (prisma as any).posterCard.count({
    where: {
      userId: user.id,
      createdAt: { gte: today },
    },
  });

  const isPremium = user.role === 'ADMIN' || user.role === 'PREMIUM'; // Adjust based on your premium logic
  const dailyLimit = isPremium ? Infinity : 1;

  if (todayPosters >= dailyLimit) {
    return validationError('Daily poster limit reached (1 free per day). Upgrade for unlimited posters!');
  }

  // Get mood trend (optional - from GlobalMood)
  let moodTrend = 'neutral';
  try {
    const globalMood = await (prisma as any).globalMood.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { dominantMood: true },
    });
    if (globalMood) {
      moodTrend = globalMood.dominantMood || 'neutral';
    }
  } catch (e) {
    // Ignore mood fetch errors
  }

  // Build stats JSON
  const statsJson = {
    archetype: user.archetype || user.archetypeKey || 'Adventurer',
    level: user.level || 1,
    xp: user.xp || 0,
    totalXP: user.userStats?.totalXP || user.xp || 0,
    karma: user.userStats?.totalKarma || 0,
    reflectionsCount: user.reflections?.length || 0,
    streakDays: user.userStats?.streakDays || user.streakCount || 0,
    moodTrend,
    rarity: rarity || 'bronze',
    generatedAt: new Date().toISOString(),
  };

  // Generate poster image URL (uses same renderer as ShareCards)
  const imageUrl = generateShareCardImage({
    xp: statsJson.totalXP,
    level: statsJson.level,
    streak: statsJson.streakDays,
    name: user.username || user.name || 'Player',
    rank: `Level ${statsJson.level}`,
  });

  // Create poster card
  const posterCard = await (prisma as any).posterCard.create({
    data: {
      userId: user.id,
      title: title || `${statsJson.archetype} - Level ${statsJson.level}`,
      statsJson,
      imageUrl,
      isShared: false,
      createdAt: new Date(),
    },
  });

  return successResponse({
    success: true,
    poster: {
      id: posterCard.id,
      title: posterCard.title,
      imageUrl: posterCard.imageUrl,
      statsJson: posterCard.statsJson,
      createdAt: posterCard.createdAt,
    },
    remainingToday: Math.max(0, dailyLimit - todayPosters - 1),
    message: 'Poster created successfully — saved to gallery',
  });
});

