import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { bulkApproveQuestions } from '@/lib/services/questionService';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { ids } = await req.json();
  const parsed = z.array(z.string()).safeParse(ids);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const result = await bulkApproveQuestions(parsed.data);
  return NextResponse.json(result);
}
