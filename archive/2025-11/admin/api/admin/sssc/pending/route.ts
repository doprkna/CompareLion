import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@parel/db/src/client';
import { toSssCategoryDTO } from '@/lib/dto/sssCategoryDTO';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const pending = await prisma.sssCategory.findMany({ where: { status: 'pending' } });
  const entries = pending.map(toSssCategoryDTO);
  return NextResponse.json({ entries });
}
