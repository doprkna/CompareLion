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
    transitionFade: number;
}
export declare function getMusicThemes(): Promise<MusicTheme[]>;
export declare function findThemeByMood(themes: MusicTheme[], moodTag: 'calm' | 'chaos' | 'joy' | 'deep' | 'battle'): MusicTheme | null;
export declare function findThemeByRegion(themes: MusicTheme[], regionKey: string): MusicTheme | null;
export declare function findThemeByArchetype(themes: MusicTheme[], archetypeKey: string): MusicTheme | null;
