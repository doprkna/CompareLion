/**
 * GET /api/news/unseen-count - Count posts newer than user's lastNewsSeenAt (Option A)
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse } from '@/lib/api-handler';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return successResponse({ count: 0 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, lastNewsSeenAt: true },
  });
  if (!user) return successResponse({ count: 0 });

  const since = user.lastNewsSeenAt ?? new Date(0);
  const count = await prisma.newsPost.count({
    where: {
      status: 'PUBLISHED',
      publishedAt: { gt: since },
    },
  });

  return successResponse({ count });
}
