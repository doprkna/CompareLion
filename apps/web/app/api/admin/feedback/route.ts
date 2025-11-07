/**
 * Admin Feedback API
 * Fetch all feedback submissions
 * v0.13.2l - Feedback Review System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, forbiddenError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/admin/feedback
 * Get all feedback submissions (admin only)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  // Get user and check admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
    return forbiddenError();
  }

  // Fetch all feedback with user info
  const feedback = await prisma.feedbackSubmission.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      submittedAt: 'desc',
    },
  });

  return successResponse({ data: feedback });
});

