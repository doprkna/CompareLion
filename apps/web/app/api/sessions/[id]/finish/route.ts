import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';

// Mark a session as complete
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.flowProgress.update({
    where: { id },
    data: { completedAt: new Date(), updatedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
