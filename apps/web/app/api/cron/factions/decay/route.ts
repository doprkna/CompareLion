import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

const DECAY_RATE = 0.02; // 2% daily decay

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const decayed = await prisma.factionInfluence.updateMany({
    data: {
      influenceScore: {
        // Decay: multiply by (1 - DECAY_RATE)
        // Prisma doesn't support multiplication directly, so we use raw SQL or calculate
      },
      dailyDelta: {
        // This would need raw SQL to multiply
      },
    },
  });

  // Use raw SQL for decay calculation
  const result = await prisma.$executeRaw`
    UPDATE faction_influence
    SET 
      influence_score = GREATEST(0, influence_score * (1 - ${DECAY_RATE})),
      daily_delta = GREATEST(0, daily_delta * (1 - ${DECAY_RATE}))
    WHERE influence_score > 0
  `;

  return NextResponse.json({ success: true, decayed: result });
});

