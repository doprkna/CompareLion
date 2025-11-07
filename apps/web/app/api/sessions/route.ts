import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { safeAsync, validationError } from '@/lib/api-handler';

// Start a new flow session
export const POST = safeAsync(async (request: NextRequest) => {
  const body = await request.json();
  const { userId, flowId } = body;

  // Find the first step in the flow (lowest order)
  const firstStep = await prisma.flowStep.findFirst({
    where: { flowId },
    orderBy: { order: 'asc' },
  });
  if (!firstStep) {
    return validationError('No steps in flow.');
  }

  // Create session (FlowProgress)
  const session = await prisma.flowProgress.create({
    data: {
      userId,
      flowId,
      currentStepId: firstStep.id,
      answers: {},
    },
  });

  // Fetch first question info
  const question = await prisma.questionVersion.findUnique({
    where: { id: firstStep.questionVersionId },
  });

  return NextResponse.json({
    success: true,
    sessionId: session.id,
    currentStepId: firstStep.id,
    question,
    timestamp: new Date().toISOString(),
  });
});
