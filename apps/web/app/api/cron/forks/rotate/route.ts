import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  // Get all active forks
  const activeForks = await prisma.dailyFork.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (activeForks.length === 0) {
    return NextResponse.json({
      success: true,
      rotated: false,
      message: 'No active forks to rotate',
    });
  }

  // Pick random fork as today's active fork (could also use a rotation logic)
  const randomIndex = Math.floor(Math.random() * activeForks.length);
  const selectedFork = activeForks[randomIndex];

  // Note: In a full implementation, you might want to track which fork is "active today"
  // For MVP, we just ensure forks are available. The /today endpoint handles selection.

  return NextResponse.json({
    success: true,
    rotated: true,
    activeFork: {
      id: selectedFork.id,
      key: selectedFork.key,
      title: selectedFork.title,
    },
    totalForks: activeForks.length,
  });
});

