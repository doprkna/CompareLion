/**
 * GET /api/admin/diagnostics
 * Admin-only runtime health and seed status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { APP_VERSION } from '@/lib/config';

function redactUrl(url: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  try {
    const u = new URL(url);
    const host = u.hostname;
    const dbName = u.pathname?.replace(/^\//, '') || undefined;
    const proto = u.protocol?.replace(':', '') || 'postgresql';
    return `${proto}://${host}${dbName ? '/' + dbName : ''}`;
  } catch {
    return undefined;
  }
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const appEnv = (process.env.APP_ENV ?? 'dev').toString().toLowerCase();
  const nodeEnv = (process.env.NODE_ENV ?? 'development').toString().toLowerCase();
  const meta: Record<string, string | undefined> = {
    appEnv,
    nodeEnv,
    vercelRegion: process.env.VERCEL_REGION,
    gitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_SHA,
    buildTime: process.env.VERCEL_BUILD_TIME,
    appVersion: APP_VERSION,
  };

  let dbConnected = false;
  let urlRedacted: string | undefined;
  let dbHost: string | undefined;
  let dbName: string | undefined;
  let dbError: string | undefined;

  const rawUrl = process.env.DATABASE_URL;
  if (rawUrl) {
    urlRedacted = redactUrl(rawUrl);
    try {
      const u = new URL(rawUrl);
      dbHost = u.hostname;
      dbName = u.pathname?.replace(/^\//, '') || undefined;
    } catch {
      dbHost = undefined;
      dbName = undefined;
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'Unknown DB error';
  }

  let seedMarkerFound = false;
  let seedMarker: string | undefined;
  let lastSeedAt: string | undefined;
  const seedCounts = { categories: 0, flowQuestions: 0, users: 0, responses: 0 };
  const seedNotes: string[] = [];

  try {
    const seedLog = await prisma.auditLog.findFirst({
      where: { action: { contains: 'seed' } },
      orderBy: { createdAt: 'desc' },
    });
    if (seedLog) {
      seedMarkerFound = true;
      seedMarker = seedLog.action;
      lastSeedAt = seedLog.createdAt.toISOString();
    }
  } catch {
    seedNotes.push('Could not query seed marker');
  }

  try {
    seedCounts.categories = await prisma.sssCategory.count();
    seedCounts.flowQuestions = await prisma.flowQuestion.count();
    seedCounts.users = await prisma.user.count();
    seedCounts.responses = await prisma.userResponse.count();
  } catch (e) {
    seedNotes.push(e instanceof Error ? e.message : 'Count query failed');
  }

  if (!seedMarkerFound && (seedCounts.categories > 0 || seedCounts.flowQuestions > 0)) {
    seedNotes.push('Inferred from counts');
  }

  let flowCanStart = false;
  let sampleCategoryId: string | undefined;
  let sampleQuestionId: string | undefined;
  let flowError: string | undefined;

  try {
    const cat = await prisma.sssCategory.findFirst({
      where: {
        flowQuestions: {
          some: { isActive: true },
        },
      },
      select: { id: true },
    });
    if (cat) {
      sampleCategoryId = cat.id;
      const q = await prisma.flowQuestion.findFirst({
        where: { categoryId: cat.id, isActive: true },
        select: { id: true },
      });
      if (q) {
        sampleQuestionId = q.id;
        flowCanStart = true;
      }
    }
  } catch (e) {
    flowError = e instanceof Error ? e.message : 'Flow query failed';
  }

  const worldCounts: Record<string, number | null> = {};
  const worldEmpty: string[] = [];
  const worldWarnings: string[] = [];

  const worldModels: Array<{ key: string; prismaKey: string }> = [
    { key: 'users', prismaKey: 'user' },
    { key: 'categories', prismaKey: 'sssCategory' },
    { key: 'flowQuestions', prismaKey: 'flowQuestion' },
    { key: 'userResponses', prismaKey: 'userResponse' },
    { key: 'items', prismaKey: 'item' },
    { key: 'inventoryItems', prismaKey: 'inventoryItem' },
    { key: 'achievements', prismaKey: 'achievement' },
    { key: 'userAchievements', prismaKey: 'userAchievement' },
    { key: 'notifications', prismaKey: 'notification' },
    { key: 'globalEvents', prismaKey: 'globalEvent' },
    { key: 'globalFeedItems', prismaKey: 'globalFeedItem' },
    { key: 'groups', prismaKey: 'group' },
    { key: 'groupMembers', prismaKey: 'groupMember' },
  ];

  for (const { key, prismaKey } of worldModels) {
    try {
      const model = (prisma as Record<string, { count: () => Promise<number> } | undefined>)[prismaKey];
      if (!model?.count) {
        worldWarnings.push(`Model ${prismaKey} missing; skipped`);
        worldCounts[key] = null;
        continue;
      }
      const n = await model.count();
      worldCounts[key] = n;
      if (n === 0) {
        worldEmpty.push(key);
      }
    } catch (e) {
      worldWarnings.push(`Model ${prismaKey}: ${e instanceof Error ? e.message : 'count failed'}`);
      worldCounts[key] = null;
    }
  }

  const ok = dbConnected;

  return NextResponse.json({
    ok,
    meta,
    db: {
      connected: dbConnected,
      urlRedacted,
      host: dbHost,
      dbName,
      error: dbError,
    },
    seed: {
      markerFound: seedMarkerFound,
      marker: seedMarker,
      lastSeedAt,
      counts: seedCounts,
      notes: seedNotes.length ? seedNotes : undefined,
    },
    flow: {
      canStart: flowCanStart,
      sampleCategoryId,
      sampleQuestionId,
      error: flowError,
    },
    world: {
      counts: worldCounts,
      empty: worldEmpty,
      warnings: worldWarnings,
    },
  });
}
