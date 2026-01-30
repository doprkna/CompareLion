export declare function useMusicTheme(): {
    themes: import("../config/musicThemes").MusicThemeConfig[];
    loading: boolean;
    error: string | null;
    getThemeByMood: (moodTag: "calm" | "chaos" | "joy" | "deep" | "battle") => import("../config/musicThemes").MusicThemeConfig | undefined;
    getThemeByRegion: (regionKey: string) => import("../config/musicThemes").MusicThemeConfig | undefined;
    getThemeByArchetype: (archetypeKey: string) => import("../config/musicThemes").MusicThemeConfig | undefined;
    reload: () => Promise<void>;
};
