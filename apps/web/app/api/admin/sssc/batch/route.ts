import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@parel/db/src/client';
import { enqueueSSSCGeneration } from '@/lib/services/questionGenService';
import { QGEN_BATCH_SIZE } from '@/lib/config';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const limit = typeof body.limit === 'number' ? body.limit : QGEN_BATCH_SIZE;

  // Find pending SSSCs
  const pending = await prisma.sssCategory.findMany({ where: { status: 'pending' }, take: limit });

  for (const leaf of pending) {
    await enqueueSSSCGeneration({ ssscId: leaf.id, targetCount: limit, overwrite: false });
    await prisma.sssCategory.update({ where: { id: leaf.id }, data: { status: 'generating' } });
  }

  return NextResponse.json({ enqueued: pending.length });
}
