import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  // For MVP, we just verify rituals are active
  // In a full implementation, this could rotate which ritual is "today's ritual"
  // For now, the /today endpoint handles random selection

  const activeRituals = await prisma.ritual.findMany({
    where: { isActive: true },
  });

  return NextResponse.json({
    success: true,
    reset: true,
    activeRituals: activeRituals.length,
    message: 'Ritual rotation ready (random selection on /today endpoint)',
  });
});

