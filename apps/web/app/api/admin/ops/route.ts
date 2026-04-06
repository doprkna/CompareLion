/**
 * GET /api/admin/ops - List last 50 OpsRuns (admin only)
 * Optional: ?userId=... filters rows where params.userId matches (Postgres JSON path).
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const userId = req.nextUrl.searchParams.get('userId')?.trim();
  const where: Prisma.OpsRunWhereInput = userId
    ? { params: { path: ['userId'], equals: userId } }
    : {};

  const runs = await prisma.opsRun.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ ok: true, data: { runs } });
}
