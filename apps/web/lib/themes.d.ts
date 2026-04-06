/**
 * PareL Multi-Theme System
 * Modular theme definitions with seasonal and pattern support
 */
export interface ThemeColors {
    bg: string;
    card: string;
    accent: string;
    text: string;
    subtle: string;
    border: string;
    success?: string;
    warning?: string;
    destructive?: string;
}
export interface Theme {
    id: string;
    key: string;
    name: string;
    description?: string;
    colors: Partial<ThemeColors>;
    pattern?: string;
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    region?: 'home-base' | 'city-echoes' | 'calm-grove' | 'night-bazaar';
    emoji?: string;
    animation?: 'fade' | 'pulse' | 'shimmer' | 'neon';
}
export declare const BASE_COLORS: ThemeColors;
export declare const REGION_THEMES: Record<string, Theme>;
export declare const THEMES: Theme[];
export declare function getTheme(themeId: string): Theme;
export declare function getThemeByKey(themeKey: string): Theme | null;
export declare function getAllThemes(): Theme[];
export declare function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter';
export declare function getSeasonalThemes(): Theme[];
export declare function mergeColors(partial: Partial<ThemeColors>): ThemeColors;
