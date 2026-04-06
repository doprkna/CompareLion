import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { skipQuestion } from '@/lib/services/flowService';
import { safeAsync } from '@/lib/api-handler';
import { logEvent } from '@/lib/logEvent';

export const runtime = 'nodejs';

export const POST = safeAsync(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;
  const userId = session.user.id;
  const { id: questionId } = await params;

  await skipQuestion(userId, questionId);
  logEvent({
    type: 'question_skip',
    userId,
    message: 'Skipped question',
    params: { questionId, channel: 'flow_category' },
  });
  return NextResponse.json({ status: 'skipped', timestamp: new Date().toISOString() });
});
