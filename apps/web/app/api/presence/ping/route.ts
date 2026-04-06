/**
 * POST /api/presence/ping
 * Heartbeat for "online now". Writes to Redis ZSET only. lastActiveAt updated via
 * POST /api/user/ping (app open, flow answer) to avoid DB writes every 30s.
 * Auth required. Rate-limited (5/20s).
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedError } from '@/lib/api-handler';
import { recordPresence } from '@/lib/presence';
import { checkPresenceRateLimit } from '@/lib/security/rateLimit';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return unauthorizedError();

  const { allowed } = await checkPresenceRateLimit(req);
  if (!allowed) return successResponse({ status: 'rate_limited' });

  await recordPresence(user.id);
  return successResponse({ status: 'ok' });
}
