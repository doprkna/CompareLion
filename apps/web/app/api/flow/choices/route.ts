/**
 * Flow Choices API (C18)
 * GET /api/flow/choices?exclude=id1,id2 - Returns 5 flow choices, optional exclude for refresh
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getFlowChoices } from '@parel/features/flow';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  let userId: string | null = null;
  if (session?.user?.email) {
    const { prisma } = await import('@/lib/db');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    userId = user?.id ?? null;
  }

  const { searchParams } = new URL(req.url);
  const excludeRaw = searchParams.get('exclude');
  const excludeIds = excludeRaw ? excludeRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;

  const choices = await getFlowChoices(userId, excludeIds);
  return successResponse(choices);
});
