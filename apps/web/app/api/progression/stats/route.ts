import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getUserStats } from '@/lib/services/progressionService';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/progression/stats
 * Get user's progression stats (level, XP, archetype, stats)
 * v0.26.6 - Archetypes & Leveling
 */
export const GET = safeAsync(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return unauthorizedError('Authentication required');
    }

    const { prisma } = await import('@/lib/db');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!user) {
      return unauthorizedError('User not found');
    }

    const stats = await getUserStats(user.id);

    return successResponse(stats);
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API ERROR]', { route: '/api/progression/stats', error: err });
    try {
      const { prisma } = await import('@/lib/db');
      const { createOpsRun, finishOpsRun } = await import('@parel/db');
      const short = err.slice(0, 200);
      const run = await createOpsRun(prisma, 'API_ERROR', 'api', {
        params: { route: '/api/progression/stats' },
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
    return NextResponse.json({ success: false, error: msg }, { status: 200 });
  }
});

