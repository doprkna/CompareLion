/**
 * GET /api/charms/today - Today's charms for user (generates if needed)
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedError } from '@/lib/api-handler';
import { getCharmsForToday } from '@/lib/charms/dailyCharmsService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return unauthorizedError();

  const data = await getCharmsForToday(user.id);
  return successResponse({
    date: data.date.toISOString(),
    items: data.items,
    total: data.total,
    completedCount: data.completedCount,
  });
}
