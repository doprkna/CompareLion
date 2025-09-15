import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

// Update a step in a flow
export async function PUT(request: Request, { params }: { params: { id: string, stepId: string } }) {
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

  return NextResponse.json({ success: true, step });
}

// Remove a step from a flow
export async function DELETE(_req: Request, { params }: { params: { id: string, stepId: string } }) {
  const { stepId } = params;
  await prisma.flowStep.delete({ where: { id: stepId } });
  return NextResponse.json({ success: true });
}
