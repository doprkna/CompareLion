import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import type { Prisma } from '@parel/db/client';
import { safeAsync } from '@/lib/api-handler';

// Create a new flow with steps and links
export const POST = safeAsync(async (request: NextRequest) => {
  const body = await request.json();
  const { name, description, metadata, steps = [], links = [] } = body;

  const  result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const flow = await tx.flow.create({
      data: { name, description, metadata },
    });
    // Create steps
    const stepRecords = [];
    for (const step of steps) {
      const stepRecord = await tx.flowStep.create({
        data: {
          flowId: flow.id,
          questionVersionId: step.questionVersionId,
          order: step.order,
          section: step.section,
          branchCondition: step.branchCondition,
          randomGroup: step.randomGroup,
          isOptional: step.isOptional ?? false,
          metadata: step.metadata,
        },
      });
      stepRecords.push(stepRecord);
    }
    // Create links
    for (const link of links) {
      await tx.flowStepLink.create({
        data: {
          fromStepId: link.fromStepId,
          toStepId: link.toStepId,
          condition: link.condition,
        },
      });
    }
    return { flow, steps: stepRecords };
  });

  return NextResponse.json({ success: true, ...result, timestamp: new Date().toISOString() });
});

// List all flows (with steps and links)
export const GET = safeAsync(async (_req: NextRequest) => {
  const flows = await prisma.flow.findMany({
    include: {
      steps: {
        include: {
          fromLinks: true,
          toLinks: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  return NextResponse.json({ success: true, flows, timestamp: new Date().toISOString() });
});
