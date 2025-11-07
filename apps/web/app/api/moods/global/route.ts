import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  // Get latest global mood snapshot
  const globalMood = await prisma.globalMood.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  // Default fallback mood if none exists
  if (!globalMood) {
    return NextResponse.json({
      success: true,
      mood: {
        dominantEmotion: 'calm',
        scoreJoy: 0,
        scoreSad: 0,
        scoreAnger: 0,
        scoreCalm: 1.0,
        updatedAt: new Date().toISOString(),
      },
      isDefault: true,
    });
  }

  return NextResponse.json({
    success: true,
    mood: {
      id: globalMood.id,
      dominantEmotion: globalMood.dominantEmotion,
      scoreJoy: globalMood.scoreJoy,
      scoreSad: globalMood.scoreSad,
      scoreAnger: globalMood.scoreAnger,
      scoreCalm: globalMood.scoreCalm,
      updatedAt: globalMood.updatedAt,
    },
  });
});

