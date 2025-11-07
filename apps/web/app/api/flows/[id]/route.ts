import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { safeAsync, notFoundError } from '@/lib/api-handler';

// Get a single flow with steps and links
export const GET = safeAsync(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  const flow = await prisma.flow.findUnique({
    where: { id },
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
  if (!flow) return notFoundError('Flow');
  return NextResponse.json({ success: true, flow, timestamp: new Date().toISOString() });
});

// Update flow metadata/settings
export const PUT = safeAsync(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  const body = await request.json();
  const { name, description, metadata } = body;
  const flow = await prisma.flow.update({
    where: { id },
    data: { name, description, metadata },
  });
  return NextResponse.json({ success: true, flow, timestamp: new Date().toISOString() });
});

// Soft delete a flow (add deletedAt to metadata)
export const DELETE = safeAsync(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  await prisma.flow.update({
    where: { id },
    data: { metadata: { deletedAt: new Date().toISOString() } },
  });
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
});
