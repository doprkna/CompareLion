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
    transitionFade: number;
}
export declare const MUSIC_THEMES: MusicThemeConfig[];
export type MusicTheme = MusicThemeConfig;
export declare function getMusicThemes(): MusicTheme[];
export declare function findThemeByMood(mood: string): MusicTheme | undefined;
export declare function findThemeByRegion(region: string): MusicTheme | undefined;
export declare function findThemeByArchetype(archetype: string): MusicTheme | undefined;
