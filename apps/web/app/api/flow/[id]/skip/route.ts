import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { skipQuestion } from '@/lib/services/flowService';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const userId = session.user.id;

  await skipQuestion(userId, params.id);
  return NextResponse.json({ status: 'skipped' });
}
