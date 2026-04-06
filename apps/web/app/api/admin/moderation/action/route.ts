/**
 * POST /api/admin/moderation/action
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedError } from '@/lib/api-handler';
import { z } from 'zod';

const ActionSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  action: z.enum(['approve', 'reject', 'shadow']),
  note: z.string().optional(),
});

const MOD_ROLES = ['ADMIN', 'MOD'];

const ACTION_TO_STATUS = {
  approve: 'APPROVED',
  reject: 'REJECTED',
  shadow: 'SHADOW_BANNED',
} as const;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || !MOD_ROLES.includes(user.role)) return unauthorizedError();

  const body = await req.json();
  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'Invalid input' }, { status: 400 });
  }

  const { entityType, entityId, action, note } = parsed.data;
  const newStatus = ACTION_TO_STATUS[action];

  const mod = await prisma.moderationEntity.findUnique({
    where: { entityType_entityId: { entityType, entityId } },
  });
  if (!mod) {
    return Response.json({ ok: false, error: 'Entity not found' }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.moderationEntity.update({
      where: { id: mod.id },
      data: {
        status: newStatus,
        lastReviewedAt: new Date(),
        reviewedBy: user.id,
      },
    }),
    prisma.entityModerationAction.create({
      data: {
        moderatorId: user.id,
        entityType,
        entityId,
        action,
        note: note ?? null,
      },
    }),
  ]);

  return successResponse({ ok: true });
}
