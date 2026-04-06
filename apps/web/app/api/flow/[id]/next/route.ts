import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { getNextQuestionForUser } from '@/lib/services/flowService';
import { safeAsync } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { logEvent } from '@/lib/logEvent';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const userId = session.user.id;
  const { id: categoryId } = await params;

  const priorInCategory = await prisma.userResponse.count({
    where: { userId, question: { categoryId } },
  });

  const question = await getNextQuestionForUser(userId, categoryId);

  if (!question) {
    logEvent({
      type: 'flow_complete',
      userId,
      message: 'Flow completed',
      params: { categoryId, channel: 'flow_category' },
    });
    return NextResponse.json({ done: true, timestamp: new Date().toISOString() }, { status: 204 });
  }

  if (priorInCategory === 0) {
    logEvent({
      type: 'flow_start',
      userId,
      message: 'Flow started',
      params: { categoryId, channel: 'flow_category' },
    });
  }

  return NextResponse.json(question);
});
