/**
 * Music Themes Configuration
 * v0.29.18 - Interactive Music Layer
 */

export interface MusicThemeConfig {
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

export const MUSIC_THEMES: MusicThemeConfig[] = [
  {
    key: 'calm-default',
    name: 'Calm Reflection',
    moodTag: 'calm',
    url: '/audio/music/calm-default.mp3',
    volumeDefault: 0.4,
    loop: true,
    transitionFade: 600,
  },
  {
    key: 'chaos-default',
    name: 'Chaotic Energy',
    moodTag: 'chaos',
    url: '/audio/music/chaos-default.mp3',
    volumeDefault: 0.5,
    loop: true,
    transitionFade: 400,
  },
  {
    key: 'joy-default',
    name: 'Joyful Melody',
    moodTag: 'joy',
    url: '/audio/music/joy-default.mp3',
    volumeDefault: 0.45,
    loop: true,
    transitionFade: 600,
  },
  {
    key: 'deep-default',
    name: 'Deep Contemplation',
    moodTag: 'deep',
    url: '/audio/music/deep-default.mp3',
    volumeDefault: 0.35,
    loop: true,
    transitionFade: 800,
  },
  {
    key: 'battle-default',
    name: 'Battle Anthem',
    moodTag: 'battle',
    url: '/audio/music/battle-default.mp3',
    volumeDefault: 0.6,
    loop: true,
    transitionFade: 300,
  },
  {
    key: 'home-base',
    name: 'Home Base Theme',
    moodTag: 'calm',
    regionKey: 'home-base',
    url: '/audio/music/home-base.mp3',
    volumeDefault: 0.4,
    loop: true,
    transitionFade: 600,
  },
  {
    key: 'city-echoes',
    name: 'City of Echoes',
    moodTag: 'deep',
    regionKey: 'city-echoes',
    url: '/audio/music/city-echoes.mp3',
    volumeDefault: 0.45,
    loop: true,
    transitionFade: 500,
  },
  {
    key: 'calm-grove',
    name: 'Calm Grove',
    moodTag: 'calm',
    regionKey: 'calm-grove',
    url: '/audio/music/calm-grove.mp3',
    volumeDefault: 0.35,
    loop: true,
    transitionFade: 800,
  },
  {
    key: 'night-bazaar',
    name: 'Night Bazaar',
    moodTag: 'chaos',
    regionKey: 'night-bazaar',
    url: '/audio/music/night-bazaar.mp3',
    volumeDefault: 0.5,
    loop: true,
    transitionFade: 400,
  },
  {
    key: 'dreamspace',
    name: 'Dreamspace Theme',
    moodTag: 'deep',
    url: '/audio/music/dreamspace.mp3',
    volumeDefault: 0.3,
    loop: true,
    transitionFade: 1000,
  },
  {
    key: 'quest-active',
    name: 'Quest Adventure',
    moodTag: 'battle',
    url: '/audio/music/quest-active.mp3',
    volumeDefault: 0.55,
    loop: true,
    transitionFade: 400,
  },
  {
    key: 'duel-active',
    name: 'Duel Intensity',
    moodTag: 'battle',
    url: '/audio/music/duel-active.mp3',
    volumeDefault: 0.65,
    loop: true,
    transitionFade: 300,
  },
];

export type MusicTheme = MusicThemeConfig; // sanity-fix

// sanity-fix: Stub functions to make @parel/core independent of web app
export function getMusicThemes(): MusicTheme[] {
  return MUSIC_THEMES;
}

export function findThemeByMood(mood: string): MusicTheme | undefined {
  return MUSIC_THEMES.find(theme => theme.moodTag === mood);
}

export function findThemeByRegion(region: string): MusicTheme | undefined {
  return MUSIC_THEMES.find(theme => theme.regionKey === region);
}

export function findThemeByArchetype(archetype: string): MusicTheme | undefined {
  return MUSIC_THEMES.find(theme => theme.archetypeKey === archetype);
}

