import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { safeAsync } from '@/lib/api-handler';

// Mark a session as complete
export const POST = safeAsync(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  await prisma.flowProgress.update({
    where: { id },
    data: { completedAt: new Date(), updatedAt: new Date() },
  });
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
});
