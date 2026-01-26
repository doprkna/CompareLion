import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }
  
  const now = new Date();
  const expired = await prisma.seasonStoryline.updateMany({
    where: {
      isActive: true,
      OR: [
        { endDate: { lte: now } },
        { endDate: null, startDate: { lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } },
      ],
    },
    data: { isActive: false },
  });
  
  return NextResponse.json({ success: true, closed: expired.count });
});






