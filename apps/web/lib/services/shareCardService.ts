/**
 * Share Card Service
 * v0.29.15 - Share Cards
 */

/**
 * Generate share card image URL
 * Returns URL to /api/share endpoint with stats
 */
export function generateShareCardImage(stats: {
  xp?: number;
  level?: number;
  streak?: number;
  name?: string;
  rank?: string;
}): string {
  const params = new URLSearchParams({
    mode: 'stats',
    xp: String(stats.xp || 0),
    level: String(stats.level || 1),
    streak: String(stats.streak || 0),
    name: stats.name || 'Player',
    rank: stats.rank || 'N/A',
  });

  return `/api/share?${params.toString()}`;
}

/**
 * Generate caption template based on type
 */
export function generateShareCardCaption(
  type: 'weekly' | 'achievement' | 'comparison',
  stats: any
): string {
  if (type === 'weekly') {
    const xpGain = stats.weeklyXP || stats.totalXP || 0;
    const xpFormatted = xpGain.toLocaleString();
    const reflections = stats.weeklyReflections || 0;
    return `My Week in PareL — ${xpFormatted} XP earned, ${reflections} reflections.`;
  } else if (type === 'achievement') {
    const level = stats.level || 1;
    const prestige = stats.prestigeCount || 0;
    const karma = stats.karmaScore || 0;
    return `My PareL Journey — Level ${level}, Prestige ${prestige}, ${karma} Karma.`;
  } else if (type === 'comparison') {
    const archetype = stats.archetype || 'Reflective';
    const title = stats.title || '';
    return `This week's archetype mood: ${archetype} ${title}`;
  }
  return 'My PareL Stats';
}

