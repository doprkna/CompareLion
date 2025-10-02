import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@parel/db/src/client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const logs = await prisma.questionGeneration.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      ssscId: true,
      createdAt: true,
      status: true,
      insertedCount: true,
      finishedAt: true,
    }
  });

  return NextResponse.json({ logs });
}
