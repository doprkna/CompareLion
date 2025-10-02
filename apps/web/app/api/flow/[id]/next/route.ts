import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { getNextQuestionForUser } from '@/lib/services/flowService';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const question = await getNextQuestionForUser(params.id, session.user.id);
  if (!question) {
    return NextResponse.json({ done: true }, { status: 204 });
  }
  return NextResponse.json(question);
}
