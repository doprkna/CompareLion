/**
 * POST /api/admin/seed-db
 * Admin-only. Runs seed-world (dev-only). Calls runSeedWorld internally.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { createOpsRun, finishOpsRun } from '@parel/db';

export async function POST(_req: NextRequest) {
  let opsRunId: string | null = null;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, ok: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const appEnv = (process.env.APP_ENV ?? 'dev').toString().toLowerCase();
    if (appEnv === 'prod' || appEnv === 'production') {
      return NextResponse.json(
        { success: false, ok: false, error: 'Reseed not allowed in production' },
        { status: 403 }
      );
    }

    const ops = await createOpsRun(prisma, 'SEED', session.user.email ?? 'admin', {
      message: 'Seeder started',
    });
    opsRunId = ops.id;

    const { runSeedWorld } = await import('@parel/db/scripts/seed-world');
    const stats = await runSeedWorld();
    const summary = Object.entries(stats)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    await finishOpsRun(prisma, ops.id, 'success', {
      message: 'Seeder completed',
    });
    return NextResponse.json({
      success: true,
      ok: true,
      message: `Database seeded successfully. ${summary}`,
      stats,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API ERROR]', { route: '/api/admin/seed-db', error: err });
    if (opsRunId) {
      try {
        await finishOpsRun(prisma, opsRunId, 'failed', {
          message: (e instanceof Error ? e.message : String(e)).slice(0, 200),
          errorStack:
            e instanceof Error ? e.stack?.slice(0, 1000) : undefined,
        });
      } catch {
        /* ignore OpsRun finish errors */
      }
    }
    const msg = err.length > 280 ? `${err.slice(0, 280)}…` : err;
    return NextResponse.json({ success: false, ok: false, error: msg }, { status: 200 });
  }
}
