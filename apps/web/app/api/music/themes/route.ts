import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { MUSIC_THEMES } from '@parel/core/config/musicThemes';

/**
 * GET /api/music/themes
 * List available tracks + metadata (cached)
 * Public endpoint
 * v0.29.18 - Interactive Music Layer
 */
export const GET = safeAsync(async (req: NextRequest) => {
  // Return themes from config
  return successResponse({
    themes: MUSIC_THEMES.map((theme) => ({
      key: theme.key,
      name: theme.name,
      moodTag: theme.moodTag,
      regionKey: theme.regionKey || null,
      archetypeKey: theme.archetypeKey || null,
      url: theme.url,
      volumeDefault: theme.volumeDefault,
      loop: theme.loop,
      transitionFade: theme.transitionFade,
    })),
    total: MUSIC_THEMES.length,
  });
});

