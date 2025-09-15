import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

// Get the current question in a session
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await prisma.flowProgress.findUnique({
    where: { id },
    include: {
      currentStep: true,
    },
  });
  if (!session || !session.currentStepId) {
    return NextResponse.json({ success: false, message: 'Session not found or no current step.' }, { status: 404 });
  }
  const question = await prisma.questionVersion.findUnique({
    where: { id: session.currentStep.questionVersionId },
  });
  return NextResponse.json({
    success: true,
    sessionId: session.id,
    currentStepId: session.currentStepId,
    question,
  });
}
