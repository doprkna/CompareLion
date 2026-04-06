/**
 * POST /api/user/ping
 * Lightweight session ping to update lastActiveAt. Call on app open and on meaningful actions.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedError } from '@/lib/api-handler';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError();

  await prisma.user.updateMany({
    where: { email: session.user.email },
    data: { lastActiveAt: new Date() },
  });

  return successResponse({ ok: true });
}
