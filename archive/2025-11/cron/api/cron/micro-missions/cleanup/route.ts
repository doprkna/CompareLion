import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const actives = await prisma.userMicroMission.findMany({ where: { status: 'active' }, include: { mission: true } });
  const now = Date.now();
  let expired = 0;
  for (const um of actives) {
    const dur = (um.mission.durationSec || 300) * 1000;
    if (now - new Date(um.startedAt).getTime() > dur) {
      await prisma.userMicroMission.update({ where: { id: um.id }, data: { status: 'expired', completedAt: new Date() } });
      expired++;
    }
  }
  return NextResponse.json({ success: true, expired });
});


