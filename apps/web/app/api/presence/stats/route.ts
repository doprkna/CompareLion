/**
 * GET /api/presence/stats
 * Returns onlineNow, active48h, active7d. Auth-only.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getOnlineCount } from '@/lib/presence';
import { NextResponse } from 'next/server';

const H48 = 48 * 60 * 60 * 1000;
const H7D = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const since48h = new Date(now.getTime() - H48);
    const since7d = new Date(now.getTime() - H7D);

    const [onlineNow, active48h, active7d] = await Promise.all([
      getOnlineCount(),
      prisma.user.count({ where: { lastActiveAt: { gte: since48h } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: since7d } } }),
    ]);

    const hasRedis = onlineNow !== null;
    const hasDb = true;
    const source = hasRedis && hasDb ? 'redis+db' : hasRedis ? 'redis-only' : 'db-only';

    return NextResponse.json({
      success: true,
      data: {
        onlineNow: onlineNow ?? 0,
        active48h,
        active7d,
        source,
        timestamp: now.toISOString(),
      },
    });
  } catch (e) {
    return NextResponse.json({
      success: true,
      data: {
        onlineNow: 0,
        active48h: 0,
        active7d: 0,
        source: 'db-only',
        timestamp: new Date().toISOString(),
      },
    });
  }
}
