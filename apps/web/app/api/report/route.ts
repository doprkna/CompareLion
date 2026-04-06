/**
 * POST /api/report
 * Report content for moderation
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedError } from '@/lib/api-handler';
import { ensureModerationEntity, recordReportAndMaybeFlag } from '@/lib/moderation/moderationService';
import { z } from 'zod';

const ReportSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  reason: z.enum(['SPAM', 'HARASSMENT', 'HATE', 'SEXUAL', 'VIOLENCE', 'MISINFORMATION', 'OTHER']),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return unauthorizedError();

  const body = await req.json();
  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 });
  }

  const { entityType, entityId, reason, message } = parsed.data;

  await ensureModerationEntity({ entityType, entityId, userId: user.id });

  await prisma.contentReport.create({
    data: {
      reporterId: user.id,
      entityType,
      entityId,
      reason,
      message: message ?? null,
    },
  });

  await recordReportAndMaybeFlag(entityType, entityId, user.id, reason, message);

  return successResponse({ reported: true });
}
