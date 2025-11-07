import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();
  // Archive expired polls by setting visibility to 'archived'
  const expired = await prisma.publicPoll.updateMany({
    where: { expiresAt: { lte: now }, visibility: { not: 'archived' } },
    data: { visibility: 'archived' },
  });

  return NextResponse.json({ success: true, archived: expired.count });
});


