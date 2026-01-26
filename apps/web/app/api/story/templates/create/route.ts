/**
 * Story Template Create API
 * Create story template
 * v0.40.9 - Story Templates Marketplace 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { createStoryTemplate, type StoryTemplateData } from '@parel/story/storyTemplateService';

/**
 * POST /api/story/templates/create
 * Create story template
 * Body: { name, description, panelCount, layoutMode, panelLabels, panelHelpTexts?, isPublic }
 */
export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await req.json();
  const { name, description, panelCount, layoutMode, panelLabels, panelHelpTexts, isPublic } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return validationError('name is required');
  }

  if (!description || typeof description !== 'string') {
    return validationError('description is required');
  }

  if (typeof panelCount !== 'number' || panelCount < 1 || panelCount > 8) {
    return validationError('panelCount must be between 1 and 8');
  }

  if (layoutMode !== 'vertical' && layoutMode !== 'grid') {
    return validationError('layoutMode must be "vertical" or "grid"');
  }

  if (!Array.isArray(panelLabels) || panelLabels.length !== panelCount) {
    return validationError(`panelLabels must be an array of length ${panelCount}`);
  }

  if (panelHelpTexts !== undefined && (!Array.isArray(panelHelpTexts) || panelHelpTexts.length !== panelCount)) {
    return validationError(`panelHelpTexts must be an array of length ${panelCount} or omitted`);
  }

  if (typeof isPublic !== 'boolean') {
    return validationError('isPublic must be a boolean');
  }

  try {
    const template = await createStoryTemplate(user.id, {
      name: name.trim(),
      description: description.trim(),
      panelCount,
      layoutMode,
      panelLabels,
      panelHelpTexts,
      isPublic,
    });

    return successResponse({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        panelCount: template.panelCount,
        layoutMode: template.layoutMode,
        panelLabels: template.panelLabels,
        panelHelpTexts: template.panelHelpTexts,
        isPublic: template.isPublic,
        createdAt: template.createdAt,
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to create template');
  }
});

