import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { safeAsync, notFoundError } from '@/lib/api-handler';

// Get the current question in a session
export const GET = safeAsync(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  const session = await prisma.flowProgress.findUnique({
    where: { id },
    include: {
      currentStep: true,
    },
  });
  if (!session || !session.currentStepId) {
    return notFoundError('Session or current step');
  }
  const question = await prisma.questionVersion.findUnique({
    where: { id: session.currentStep?.questionVersionId },
  });
  return NextResponse.json({
    success: true,
    sessionId: session.id,
    currentStepId: session.currentStepId,
    question,
    timestamp: new Date().toISOString(),
  });
});
