export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { requireSession } from '@/lib/auth/requireSession';
import { toJobDTO } from '@/lib/dto/jobDTO';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const jobLogRaw = await prisma.jobLog.findUnique({ where: { id: params.id } });
  if (!jobLogRaw) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const dto = toJobDTO(jobLogRaw);
  return NextResponse.json(dto);
}
