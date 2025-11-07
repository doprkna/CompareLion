/**
 * Global Mood API (v0.29.26)
 * 
 * GET /api/mood/global
 * Returns current GlobalMood + trend data
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (req: NextRequest) => {
  // Get latest global mood (only 1 active record)
  const globalMood = await (prisma as any).globalMood.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  // Get trend data (last 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentLogs = await (prisma as any).userMoodLog.findMany({
    where: {
      loggedAt: { gte: twentyFourHoursAgo },
    },
    select: {
      mood: true,
      loggedAt: true,
    },
    orderBy: { loggedAt: 'desc' },
    take: 1000, // Limit for performance
  });

  // Calculate trend
  const calmCount = recentLogs.filter((log: any) => log.mood === 'calm').length;
  const chaosCount = recentLogs.filter((log: any) => log.mood === 'chaos').length;
  const neutralCount = recentLogs.filter((log: any) => log.mood === 'neutral').length;
  const totalCount = recentLogs.length;

  // Default fallback if no global mood exists
  if (!globalMood) {
    return successResponse({
      mood: {
        calmScore: totalCount > 0 ? calmCount / totalCount : 0.33,
        chaosScore: totalCount > 0 ? chaosCount / totalCount : 0.33,
        neutralScore: totalCount > 0 ? neutralCount / totalCount : 0.34,
        dominantMood: 'neutral',
        worldModifier: null,
        updatedAt: new Date().toISOString(),
      },
      trend: {
        calm: calmCount,
        chaos: chaosCount,
        neutral: neutralCount,
        total: totalCount,
      },
      isDefault: true,
    });
  }

  // Calculate percentages
  const totalScore = globalMood.calmScore + globalMood.chaosScore + globalMood.neutralScore;
  const calmPercent = totalScore > 0 ? (globalMood.calmScore / totalScore) * 100 : 0;
  const chaosPercent = totalScore > 0 ? (globalMood.chaosScore / totalScore) * 100 : 0;
  const neutralPercent = totalScore > 0 ? (globalMood.neutralScore / totalScore) * 100 : 0;

  // Determine world modifier description
  let modifierDescription = null;
  if (globalMood.worldModifier) {
    const modifier = globalMood.worldModifier as any;
    if (globalMood.dominantMood === 'calm' && calmPercent >= 60) {
      modifierDescription = '+2% reflection XP bonus active';
    } else if (globalMood.dominantMood === 'chaos' && chaosPercent >= 60) {
      modifierDescription = 'Wild events intensified';
    } else if (globalMood.dominantMood === 'neutral') {
      modifierDescription = '+1 karma per action';
    }
  }

  return successResponse({
    mood: {
      id: globalMood.id,
      calmScore: globalMood.calmScore,
      chaosScore: globalMood.chaosScore,
      neutralScore: globalMood.neutralScore,
      calmPercent: Math.round(calmPercent * 100) / 100,
      chaosPercent: Math.round(chaosPercent * 100) / 100,
      neutralPercent: Math.round(neutralPercent * 100) / 100,
      dominantMood: globalMood.dominantMood,
      worldModifier: globalMood.worldModifier,
      modifierDescription,
      updatedAt: globalMood.updatedAt,
    },
    trend: {
      calm: calmCount,
      chaos: chaosCount,
      neutral: neutralCount,
      total: totalCount,
    },
    isDefault: false,
  });
});

