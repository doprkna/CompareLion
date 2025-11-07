import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { safeAsync } from '@/lib/api-handler';

// Add a step to a flow
export const POST = safeAsync(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id: flowId } = params;
  const body = await request.json();
  const { questionVersionId, order, section, branchCondition, randomGroup, isOptional, metadata } = body;

  const step = await prisma.flowStep.create({
    data: {
      flowId,
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
