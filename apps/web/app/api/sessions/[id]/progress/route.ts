import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { safeAsync, notFoundError } from '@/lib/api-handler';

// Get progress info for a session
export const GET = safeAsync(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  const session = await prisma.flowProgress.findUnique({
    where: { id },
    include: { 
	flow: { include: { steps: true } },
	answers: true,
	},
  });
  if (!session) {
    return notFoundError('Session');
  }
  const total = session.flow.steps.length;
  const answered = session.answers.length;
  const completed = !!session.completedAt;
  return NextResponse.json({
    success: true,
    sessionId: id,
    total,
    answered,
    completed,
    timestamp: new Date().toISOString(),
  });
});
