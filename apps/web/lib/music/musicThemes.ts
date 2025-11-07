/**
 * Music Themes Configuration
 * v0.29.18 - Interactive Music Layer
 */

export interface MusicTheme {
  key: string;
  name: string;
  moodTag: 'calm' | 'chaos' | 'joy' | 'deep' | 'battle';
  regionKey?: string;
  archetypeKey?: string;
  url: string;
  volumeDefault: number;
  loop: boolean;
  transitionFade: number; // ms
}

export async function getMusicThemes(): Promise<MusicTheme[]> {
  try {
    const res = await fetch('/api/music/themes', { cache: 'revalidate', next: { revalidate: 3600 } });
    const json = await res.json();
    if (json.success && json.themes) {
      return json.themes;
    }
  } catch (e) {
    console.error('[MUSIC] Failed to load themes:', e);
  }
  return [];
}

export function findThemeByMood(
  themes: MusicTheme[],
  moodTag: 'calm' | 'chaos' | 'joy' | 'deep' | 'battle'
): MusicTheme | null {
  const matchingThemes = themes.filter((t) => t.moodTag === moodTag);
  if (matchingThemes.length === 0) {
    // Fallback to calm
    return themes.find((t) => t.moodTag === 'calm') || themes[0] || null;
  }
  // Pick random from matching themes
  return matchingThemes[Math.floor(Math.random() * matchingThemes.length)];
}

export function findThemeByRegion(
  themes: MusicTheme[],
  regionKey: string
): MusicTheme | null {
  const regionTheme = themes.find((t) => t.regionKey === regionKey);
  if (regionTheme) {
    return regionTheme;
  }
  // Fallback to region's default mood or calm
  return themes.find((t) => t.moodTag === 'calm') || themes[0] || null;
}

export function findThemeByArchetype(
  themes: MusicTheme[],
  archetypeKey: string
): MusicTheme | null {
  const archetypeTheme = themes.find((t) => t.archetypeKey === archetypeKey);
  if (archetypeTheme) {
    return archetypeTheme;
  }
  // Fallback to calm
  return themes.find((t) => t.moodTag === 'calm') || themes[0] || null;
}

