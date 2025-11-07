import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { safeAsync } from '@/lib/api-handler';

// Update a step in a flow
export const PUT = safeAsync(async (request: NextRequest, { params }: { params: { id: string, stepId: string } }) => {
  const { stepId } = params;
  const body = await request.json();
  const { questionVersionId, order, section, branchCondition, randomGroup, isOptional, metadata } = body;

  const step = await prisma.flowStep.update({
    where: { id: stepId },
    data: {
      questionVersionId,
      order,
      section,
      branchCondition,
      randomGroup,
      isOptional: isOptional ?? false,
      metadata,
    },
  });

  return NextResponse.json({ success: true, step, timestamp: new Date().toISOString() });
});

// Remove a step from a flow
export const DELETE = safeAsync(async (_req: NextRequest, { params }: { params: { id: string, stepId: string } }) => {
  const { stepId } = params;
  await prisma.flowStep.delete({ where: { id: stepId } });
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
});
