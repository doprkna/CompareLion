/**
 * GET /api/welcome/recap
 * Lightweight recap for Welcome Back screen. Returns yesterday stats + isReturning.
 * Fallback to synthetic/blended when data unavailable.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        streakCount: true,
        lastActiveAt: true,
        lastLoginAt: true,
      },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);

    const lastActive = user.lastActiveAt ?? user.lastLoginAt ?? null;
    const isReturning = !!lastActive && new Date(lastActive) < todayStart;

    let yesterdayAnswered = 0;
    try {
      yesterdayAnswered = await prisma.userResponse.count({
        where: {
          userId: user.id,
          skipped: false,
          createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
        },
      });
    } catch {
      yesterdayAnswered = 0;
    }

    const XP_PER_ANSWER = 10;
    const yesterdayXp = yesterdayAnswered * XP_PER_ANSWER;

    const streakCount = user.streakCount ?? 0;

    const socialOptions = [
      null,
      '3 friends answered while you were away.',
      'Trending in your region.',
    ];
    const r = (yesterdayAnswered + streakCount) % 3;
    const socialHint = socialOptions[r] ?? null;

    let yesterdayCharmsCompleted = 0;
    let yesterdayCharmsTotal = 0;
    try {
      const yesterdayCharms = await prisma.userDailyCharm.findMany({
        where: { userId: user.id, date: yesterdayStart, completed: true },
        select: { id: true },
      });
      yesterdayCharmsCompleted = yesterdayCharms.length;
      const total = await prisma.userDailyCharm.count({
        where: { userId: user.id, date: yesterdayStart },
      });
      yesterdayCharmsTotal = total;
    } catch {
      // ignore
    }

    return NextResponse.json({
      ok: true,
      data: {
        yesterdayAnswered,
        yesterdayXp,
        streakCount,
        isReturning,
        socialHint,
        yesterdayCharmsCompleted,
        yesterdayCharmsTotal,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'SERVICE_UNAVAILABLE', data: { yesterdayAnswered: 0, yesterdayXp: 0, streakCount: 0, isReturning: true, socialHint: null, yesterdayCharmsCompleted: 0, yesterdayCharmsTotal: 0 } },
      { status: 503 }
    );
  }
}
