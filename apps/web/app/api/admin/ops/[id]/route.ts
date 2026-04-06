/**
 * GET /api/admin/ops/[id] - Single OpsRun detail (admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { id } = await params;
  const run = await prisma.opsRun.findUnique({ where: { id } });
  if (!run) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: { run } });
}
