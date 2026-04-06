/**
 * POST /api/flow/skip-suggestion
 * Records skip suggestion metrics for analysis.
 * Body: { action: 'triggered' | 'accepted' }
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, authError } from '@/lib/api-handler';
import { extractIpFromRequest } from '@/lib/services/auditService';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  const body = await req.json().catch(() => ({}));
  const action = body?.action;
  if (action !== 'triggered' && action !== 'accepted') {
    return successResponse({ ok: true }); // No-op for invalid
  }

  try {
    const ip = extractIpFromRequest(req);
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        ip,
        action: `flow_skip_suggestion_${action}`,
        meta: { timestamp: new Date().toISOString() },
      },
    });
  } catch {
    // Fire-and-forget; don't fail the request
  }

  return successResponse({ ok: true });
}
