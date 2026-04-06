import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, successResponse, authError } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * POST /api/flow/starter-complete
 * Mark starter flow as completed for the current user.
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();
  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });
  if (!user) return authError();
  await prisma.user.update({
    where: { id: user.id },
    data: { starterFlowCompletedAt: new Date() }
  });
  return successResponse({ ok: true });
});
