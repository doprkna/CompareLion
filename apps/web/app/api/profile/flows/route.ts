import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { getUserFromRequest } from '../../_utils';

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const flows = await prisma.flowProgress.findMany({
	where: { userId: user.userId, completedAt: { not: null } },
	include: { flow: true, answers: true },
	orderBy: { completedAt: 'desc' },
  });
  const history = flows.map(f => ({
	  flowId: f.flowId,
	  flowName: f.flow?.name,
	  startedAt: f.startedAt,
	  completedAt: f.completedAt,
	  totalQuestions: f.answers ? f.answers.length : undefined,
  }));
  return NextResponse.json({ success: true, history });
}
