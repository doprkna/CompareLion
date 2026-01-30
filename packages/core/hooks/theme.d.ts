export type ThemeName = 'light' | 'dark' | 'auto';
export interface ThemeConfig {
    name: ThemeName;
    label: string;
    colors: {
        primary: string;
        background: string;
        text: string;
    };
}
export declare const DEFAULT_THEME: ThemeName;
export declare function getStoredTheme(): ThemeName;
export declare function setStoredTheme(theme: ThemeName): void;
export declare function applyTheme(theme: ThemeName): void;
export declare function getThemeConfig(theme: ThemeName): ThemeConfig;
export declare function getAllThemes(): ThemeConfig[];
export declare function getNextTheme(currentTheme: ThemeName): ThemeName;
