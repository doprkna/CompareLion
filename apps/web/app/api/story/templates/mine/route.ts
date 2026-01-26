/**
 * My Story Templates API
 * Get user's templates
 * v0.40.9 - Story Templates Marketplace 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getUserTemplates } from '@parel/story/storyTemplateService';

/**
 * GET /api/story/templates/mine
 * Get user's templates
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
    const templates = await getUserTemplates(user.id);

    return successResponse({
      success: true,
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        panelCount: t.panelCount,
        layoutMode: t.layoutMode,
        panelLabels: t.panelLabels,
        panelHelpTexts: t.panelHelpTexts,
        isPublic: t.isPublic,
        createdAt: t.createdAt,
      })),
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      error: error.message || 'Failed to fetch templates',
      templates: [],
    });
  }
});

