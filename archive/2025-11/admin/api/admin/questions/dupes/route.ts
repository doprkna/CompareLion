import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { findLikelyDuplicates } from '@/lib/services/questionService';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const ssscId = req.nextUrl.searchParams.get('ssscId') || '';
  if (!ssscId) {
    return NextResponse.json({ error: 'ssscId required' }, { status: 400 });
  }

  const dupes = await findLikelyDuplicates(ssscId);
  return NextResponse.json({ dupes });
}
