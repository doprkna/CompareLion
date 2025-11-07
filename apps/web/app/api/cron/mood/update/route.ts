/**
 * Mood Update Cron (v0.29.26)
 * 
 * POST /api/cron/mood/update
 * Aggregates logs hourly:
 * - Calculates mood ratios
 * - Sets dominantMood and applies global modifiers
 * - Auto-purges logs older than 7 days
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Get all mood logs from last hour (lightweight aggregation)
  const recentLogs = await (prisma as any).userMoodLog.findMany({
    where: {
      loggedAt: { gte: oneHourAgo },
    },
    select: {
      mood: true,
    },
  });

  // Aggregate mood scores
  let calmCount = 0;
  let chaosCount = 0;
  let neutralCount = 0;

  recentLogs.forEach((log: any) => {
    if (log.mood === 'calm') calmCount++;
    else if (log.mood === 'chaos') chaosCount++;
    else neutralCount++;
  });

  const totalCount = recentLogs.length;

  // Calculate scores (use counts as scores for simplicity)
  const calmScore = calmCount;
  const chaosScore = chaosCount;
  const neutralScore = neutralCount;

  // Determine dominant mood
  let dominantMood: 'calm' | 'chaos' | 'neutral' = 'neutral';
  if (calmScore > chaosScore && calmScore > neutralScore) {
    dominantMood = 'calm';
  } else if (chaosScore > calmScore && chaosScore > neutralScore) {
    dominantMood = 'chaos';
  }

  // Calculate percentages for modifier logic
  const totalScore = calmScore + chaosScore + neutralScore;
  const calmPercent = totalScore > 0 ? (calmScore / totalScore) * 100 : 0;
  const chaosPercent = totalScore > 0 ? (chaosScore / totalScore) * 100 : 0;

  // Apply world modifiers based on dominant mood
  let worldModifier: any = null;

  if (dominantMood === 'calm' && calmPercent >= 60) {
    worldModifier = {
      type: 'calm',
      effect: 'reflectionXPBonus',
      value: 0.02, // +2% reflection XP bonus
      description: '+2% reflection XP bonus active',
    };
  } else if (dominantMood === 'chaos' && chaosPercent >= 60) {
    worldModifier = {
      type: 'chaos',
      effect: 'wildcardChance',
      value: 1.5, // 1.5x wildcard chance
      description: 'Wild events intensified',
    };
  } else if (dominantMood === 'neutral') {
    worldModifier = {
      type: 'neutral',
      effect: 'karmaGain',
      value: 1, // +1 karma per action
      description: '+1 karma per action',
    };
  }

  // Update or create global mood (only 1 active record - overwrites hourly)
  const existingMood = await (prisma as any).globalMood.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  if (existingMood) {
    // Update existing record
    await (prisma as any).globalMood.update({
      where: { id: existingMood.id },
      data: {
        calmScore,
        chaosScore,
        neutralScore,
        dominantMood,
        worldModifier,
        updatedAt: now,
      },
    });
  } else {
    // Create new record
    await (prisma as any).globalMood.create({
      data: {
        calmScore,
        chaosScore,
        neutralScore,
        dominantMood,
        worldModifier,
        updatedAt: now,
      },
    });
  }

  // Auto-purge logs older than 7 days
  const purged = await (prisma as any).userMoodLog.deleteMany({
    where: {
      loggedAt: { lt: sevenDaysAgo },
    },
  });

  return successResponse({
    success: true,
    aggregation: {
      calm: calmCount,
      chaos: chaosCount,
      neutral: neutralCount,
      total: totalCount,
      calmPercent: Math.round(calmPercent * 100) / 100,
      chaosPercent: Math.round(chaosPercent * 100) / 100,
    },
    dominantMood,
    worldModifier,
    purged: purged.count,
    message: `Global mood updated: ${dominantMood} (${purged.count} old logs purged)`,
  });
});

