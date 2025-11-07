import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getAllThemes } from '@/lib/themes';

/**
 * GET /api/themes
 * Returns all available themes
 * v0.29.11 - Visual Identity & Theme Pass
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const themes = getAllThemes();
  
  return successResponse({
    themes: themes.map((theme) => ({
      key: theme.key || theme.id,
      id: theme.id,
      name: theme.name,
      description: theme.description,
      emoji: theme.emoji,
      region: theme.region,
      season: theme.season,
      animation: theme.animation,
    })),
    total: themes.length,
  });
});

