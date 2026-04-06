/**
 * GET /api/admin/visits — Visit stats (admin only).
 * v0.48.02 — base counter
 * v0.48.03 — active 24h metrics
 * v0.48.04 — active 7d metrics
 * v0.48.05 — returning users % (7d, derived from AppVisit)
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';
import { createOpsRun, finishOpsRun } from '@parel/db';

export const runtime = 'nodejs';

const MS_24H = 24 * 60 * 60 * 1000;
const MS_7D = 7 * MS_24H;

function startOfUtcDay(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function since24hAgo(): Date {
  return new Date(Date.now() - MS_24H);
}

function since7dAgo(): Date {
  return new Date(Date.now() - MS_7D);
}

const visitsEmptyPayload = {
  ok: true as const,
  totalVisits: 0,
  visitsToday: 0,
  uniqueUsersToday: 0,
  activeUsers24h: 0,
  activeLoggedUsers24h: 0,
  anonymousVisits24h: 0,
  activeUsers7d: 0,
  activeLoggedUsers7d: 0,
  anonymousUsers7d: 0,
  returningUsers7d: 0,
  returningUsersPct7d: 0,
};

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  try {
  const startOfToday = startOfUtcDay();
  const since24h = since24hAgo();
  const since7d = since7dAgo();

  const [
    totalVisits,
    visitsToday,
    uniqueGrouped,
    activeUsers24h,
    loggedUsersGrouped24h,
    anonymousVisits24h,
    activeUsers7d,
    anonymousUsers7d,
    loggedUsersGrouped7d,
  ] = await Promise.all([
    prisma.appVisit.count(),
    prisma.appVisit.count({
      where: { createdAt: { gte: startOfToday } },
    }),
    prisma.appVisit.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: startOfToday },
        userId: { not: null },
      },
    }),
    prisma.appVisit.count({
      where: { createdAt: { gte: since24h } },
    }),
    prisma.appVisit.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: since24h },
        userId: { not: null },
      },
    }),
    prisma.appVisit.count({
      where: {
        createdAt: { gte: since24h },
        userId: null,
      },
    }),
    prisma.appVisit.count({
      where: { createdAt: { gte: since7d } },
    }),
    prisma.appVisit.count({
      where: {
        createdAt: { gte: since7d },
        userId: null,
      },
    }),
    prisma.appVisit.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: since7d },
        userId: { not: null },
      },
      _count: { _all: true },
    }),
  ]);

  const uniqueUsersToday = uniqueGrouped.length;
  const activeLoggedUsers24h = loggedUsersGrouped24h.length;

  const activeLoggedUsers7d = loggedUsersGrouped7d.length;
  const returningUsers7d = loggedUsersGrouped7d.filter((g) => g._count._all > 1).length;
  const returningUsersPct7d =
    activeLoggedUsers7d === 0
      ? 0
      : Math.round((returningUsers7d / activeLoggedUsers7d) * 1000) / 10;

  return NextResponse.json({
    ok: true,
    totalVisits,
    visitsToday,
    uniqueUsersToday,
    activeUsers24h,
    activeLoggedUsers24h,
    anonymousVisits24h,
    activeUsers7d,
    activeLoggedUsers7d,
    anonymousUsers7d,
    returningUsers7d,
    returningUsersPct7d,
  });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API ERROR]', { route: '/api/admin/visits', error: err });
    try {
      const short = err.slice(0, 200);
      const run = await createOpsRun(prisma, 'API_ERROR', 'api', {
        params: { route: '/api/admin/visits' },
        message: short,
      });
      await finishOpsRun(prisma, run.id, 'failed', {
        message: short,
        errorStack: e instanceof Error ? e.stack?.slice(0, 1000) : undefined,
      });
    } catch {
      /* OpsRun logging optional */
    }
    const msg = err.length > 280 ? `${err.slice(0, 280)}…` : err;
    return NextResponse.json(
      { ...visitsEmptyPayload, ok: false, success: false, error: msg },
      { status: 200 }
    );
  }
}
