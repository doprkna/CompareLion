/**
 * Own Templates API
 * Get current user's templates
 * v0.38.14 - Template Marketplace
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getOwnTemplates } from '@/lib/rating/templateService';

/**
 * GET /api/templates/own
 * Get current user's templates
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  try {
    const templates = await getOwnTemplates(user.id);

    return successResponse({
      success: true,
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        categoryLabel: t.categoryLabel,
        metrics: t.metrics,
        promptTemplate: t.promptTemplate,
        icon: t.icon,
        isPublic: t.isPublic,
        createdAt: t.createdAt.toISOString(),
      })),
      count: templates.length,
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      templates: [],
      count: 0,
      error: error.message || 'Failed to get templates',
    });
  }
});

