/**
 * Story Template Detail API
 * Get template by ID
 * v0.40.9 - Story Templates Marketplace 1.0
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getTemplateById } from '@parel/story/storyTemplateService';

/**
 * GET /api/story/templates/[id]
 * Get template by ID
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const templateId = params.id;

  if (!templateId) {
    return validationError('Template ID is required');
  }

  try {
    const template = await getTemplateById(templateId);

    if (!template) {
      return validationError('Template not found');
    }

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
    return validationError(error.message || 'Failed to fetch template');
  }
});

