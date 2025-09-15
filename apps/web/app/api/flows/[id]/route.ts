import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

// Get a single flow with steps and links
export async function GET(_req: Request, { params }: { params: { id: string } }) {
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
  if (!flow) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, flow });
}

// Update flow metadata/settings
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const { name, description, metadata } = body;
  const flow = await prisma.flow.update({
    where: { id },
    data: { name, description, metadata },
  });
  return NextResponse.json({ success: true, flow });
}

// Soft delete a flow (add deletedAt to metadata)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.flow.update({
    where: { id },
    data: { metadata: { deletedAt: new Date().toISOString() } },
  });
  return NextResponse.json({ success: true });
}
