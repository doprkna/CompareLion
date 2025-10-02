import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@parel/db/src/client';
import { enqueueSSSCGeneration } from '@/lib/services/questionGenService';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(_req);
  if (admin instanceof NextResponse) return admin;
  const id = params.id;

  // Fetch leaf
  const leaf = await prisma.sssCategory.findUnique({ where: { id } });
  if (!leaf) {
    return NextResponse.json({ error: 'SSSC not found' }, { status: 404 });
  }

  // If failed, reset error and status
  if (leaf.status === 'failed') {
    await prisma.sssCategory.update({ where: { id }, data: { status: 'pending', error: null } });
  }

  // Enqueue generation (targetCount from config or default)
  await enqueueSSSCGeneration({ ssscId: id, targetCount: undefined, overwrite: false });

  return NextResponse.json({ enqueued: true });
}
