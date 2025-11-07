import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { getUserFromRequest } from '@/app/api/_utils';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (request: NextRequest) => {
  const user = await getUserFromRequest(request);
  if (!user) {
    return unauthorizedError('Unauthorized');
  }

  const flows = await prisma.flowProgress.findMany({
    where: { userId: user.userId, completedAt: { not: null } },
    include: { flow: true, answers: true },
    orderBy: { completedAt: 'desc' },
  });

  const history = flows.map((f: {
    flowId: string;
    flow?: { name?: string };
    startedAt: Date;
    completedAt: Date | null;
    answers?: unknown[];
  }) => ({
    flowId: f.flowId,
    flowName: f.flow?.name,
    startedAt: f.startedAt,
    completedAt: f.completedAt,
    totalQuestions: f.answers ? f.answers.length : undefined,
  }));

  return NextResponse.json({ success: true, history, timestamp: new Date().toISOString() });
});
