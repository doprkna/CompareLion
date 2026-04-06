import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getAvailableCategories } from '@parel/features/flow';
import { safeAsync, successResponse } from '@/lib/api-handler';

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';

/**
 * GET /api/flow/categories
 * Get available categories for flow. Applies Level 3 gate when authenticated.
 */
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
  const categories = await getAvailableCategories(userId);
  return successResponse(categories);
});


