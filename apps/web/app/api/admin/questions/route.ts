import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { listQuestionsByLeaf, countQuestionsByLeaf } from '@/lib/services/questionService';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const params = req.nextUrl.searchParams;
  const ssscId = params.get('ssscId') || '';
  if (!ssscId) {
    return NextResponse.json({ error: 'ssscId required' }, { status: 400 });
  }
  const approvedParam = params.get('approved') || 'all';
  const approved = approvedParam === 'approved' ? true : approvedParam === 'unapproved' ? false : undefined;

  const [items, counts] = await Promise.all([
    listQuestionsByLeaf({ ssscId, approved }),
    countQuestionsByLeaf(ssscId),
  ]);

  return NextResponse.json({ items, counts });
}
