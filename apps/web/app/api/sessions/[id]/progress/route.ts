import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

// Get progress info for a session
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await prisma.flowProgress.findUnique({
    where: { id },
    include: { flow: { include: { steps: true } } },
  });
  if (!session) {
    return NextResponse.json({ success: false, message: 'Session not found.' }, { status: 404 });
  }
  const total = session.flow.steps.length;
  const answered = session.answers ? Object.keys(session.answers).length : 0;
  const completed = !!session.completedAt;
  return NextResponse.json({
    success: true,
    sessionId: id,
    total,
    answered,
    completed,
  });
}
