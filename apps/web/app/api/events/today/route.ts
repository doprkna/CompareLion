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

function k(region: string) { return `event:today:${region.toUpperCase()}`; }

export const GET = safeAsync(async (req: NextRequest) => {
  const region = (req.nextUrl.searchParams.get('region') || 'GLOBAL').toUpperCase();
  const todayStart = new Date(); todayStart.setUTCHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setUTCHours(23,59,59,999);

  // cache first
  const redis = getRedis();
  if (redis) {
    try {
      const cached = await redis.get(k(region));
      if (cached) {
        let parsedCache; // sanity-fix
        try { parsedCache = JSON.parse(cached); } catch { parsedCache = null; } // sanity-fix
        if (parsedCache) { // sanity-fix
          const res = NextResponse.json(parsedCache); // sanity-fix
          res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
          return res;
        } // sanity-fix
      }
    } catch {}
  }

  // by region then global
  const event = await prisma.miniEvent.findFirst({
    where: {
      isActive: true,
      date: { gte: todayStart, lte: todayEnd },
      region: region,
    },
    select: { id: true, date: true, region: true, title: true, description: true, rewardText: true, tags: true, isActive: true },
  }) || await prisma.miniEvent.findFirst({
    where: {
      isActive: true,
      date: { gte: todayStart, lte: todayEnd },
      region: 'GLOBAL',
    },
    select: { id: true, date: true, region: true, title: true, description: true, rewardText: true, tags: true, isActive: true },
  });

  const payload = { success: true, event: event || null, region, timestamp: new Date().toISOString() };
  const redis2 = getRedis();
  if (redis2) { try { await redis2.set(k(region), JSON.stringify(payload), 'EX', 300); } catch {} }
  const res = NextResponse.json(payload);
  res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  return res;
});


