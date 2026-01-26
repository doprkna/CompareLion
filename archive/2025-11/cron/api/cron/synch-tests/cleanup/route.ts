import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();
  const expireTime = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago

  const expired = await prisma.userSynchTest.updateMany({
    where: {
      status: 'pending',
      createdAt: { lte: expireTime },
    },
    data: { status: 'expired' },
  });

  return NextResponse.json({ success: true, expired: expired.count });
});

