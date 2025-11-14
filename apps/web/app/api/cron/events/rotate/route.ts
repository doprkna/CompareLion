import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;
let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!_redis && REDIS_URL) {
    try {
      _redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true });
    } catch {
      _redis = null;
    }
  }
  return _redis;
}

async function invalidate(region: string) {
  const redis = getRedis();
  if (!redis) return;
  try { await redis.del(`event:today:${region.toUpperCase()}`); } catch {}
}

export const GET = safeAsync(async (_req: NextRequest) => {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  // Deactivate events not today but still active
  const deactivated = await prisma.miniEvent.updateMany({
    where: { isActive: true, NOT: { date: { gte: todayStart, lte: todayEnd } } },
    data: { isActive: false },
  });

  // Activate today's events (by date)
  const activated = await prisma.miniEvent.updateMany({
    where: { date: { gte: todayStart, lte: todayEnd } },
    data: { isActive: true },
  });

  // Invalidate caches per distinct region present today
  const regions = await prisma.miniEvent.findMany({
    where: { date: { gte: todayStart, lte: todayEnd } },
    select: { region: true },
    distinct: ['region'],
  });
  await Promise.all(regions.map(r => invalidate(r.region)));

  // Prefetch next day event into cache for fast switch (if any)
  const nextStart = new Date(todayStart); nextStart.setUTCDate(nextStart.getUTCDate() + 1);
  const nextEnd = new Date(todayEnd); nextEnd.setUTCDate(nextEnd.getUTCDate() + 1);
  const nextDayEvents = await prisma.miniEvent.findMany({
    where: { date: { gte: nextStart, lte: nextEnd } },
    select: { id: true, region: true, date: true, title: true, description: true, rewardText: true, tags: true, isActive: true },
  });
  const redis = getRedis();
  if (redis) {
    for (const ev of nextDayEvents) {
      try {
        await redis.set(`event:today:${ev.region.toUpperCase()}:prefetch`, JSON.stringify({ success: true, event: ev, region: ev.region, timestamp: new Date().toISOString() }), 'EX', 86400);
      } catch {}
    }
  }

  // Debug logs
  console.log(`[EventsRotate] Deactivated: ${deactivated.count}, Activated: ${activated.count}, Regions: ${regions.map(r=>r.region).join(',')}`);

  return NextResponse.json({ success: true, deactivated: deactivated.count, activated: activated.count, regions: regions.map(r=>r.region), timestamp: new Date().toISOString() });
});


