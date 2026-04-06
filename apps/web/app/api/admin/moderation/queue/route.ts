/**
 * GET /api/admin/moderation/queue
 * Returns entities in PENDING_REVIEW or FLAGGED
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedError } from '@/lib/api-handler';

const MOD_ROLES = ['ADMIN', 'MOD'];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || !MOD_ROLES.includes(user.role)) return unauthorizedError();

  const items = await prisma.moderationEntity.findMany({
    where: { status: { in: ['PENDING_REVIEW', 'FLAGGED'] } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const reportCounts = await prisma.contentReport.groupBy({
    by: ['entityType', 'entityId'],
    where: {
      entityType: { in: items.map((i) => i.entityType) },
      entityId: { in: items.map((i) => i.entityId) },
    },
    _count: true,
  });
  const countMap = new Map(
    reportCounts.map((r) => [`${r.entityType}:${r.entityId}`, r._count])
  );

  const queue = items.map((item) => ({
    id: item.id,
    entityType: item.entityType,
    entityId: item.entityId,
    userId: item.userId,
    status: item.status,
    autoFlagScore: item.autoFlagScore,
    isAutoFlagged: item.isAutoFlagged,
    createdAt: item.createdAt,
    reportsCount: countMap.get(`${item.entityType}:${item.entityId}`) ?? 0,
    preview: null,
  }));

  return successResponse({ queue });
}
