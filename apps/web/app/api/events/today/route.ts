import { NextRequest, NextResponse } from 'next/server';
import { safeAsync, requireDb } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { getRedisClient, hasRedis } from '@parel/redis';

function getRedis() {
  if (!hasRedis) return null;
  return getRedisClient();
}

function k(region: string) { return `event:today:${region.toUpperCase()}`; }

export const GET = safeAsync(async (req: NextRequest) => {
  const dbCheck = requireDb(req);
  if (dbCheck) return dbCheck;
  
  const region = (req.nextUrl.searchParams.get('region') || 'GLOBAL').toUpperCase();
  const todayStart = new Date(); todayStart.setUTCHours(0,0,0,0);
  const todayEnd = new Date(); todayEnd.setUTCHours(23,59,59,999);

  try {
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

    const payload = { success: true, event: event ?? null, region, timestamp: new Date().toISOString() };
    const redis2 = getRedis();
    if (redis2) { try { await redis2.set(k(region), JSON.stringify(payload), 'EX', 300); } catch {} }
    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res;
  } catch {
    const fallback = {
      success: true,
      event: null,
      region,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(fallback, { status: 200 });
  }
});


