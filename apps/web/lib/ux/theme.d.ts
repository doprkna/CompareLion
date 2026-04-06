/**
 * Theme Utilities
 * v0.34.5 - Multi-theme support (light, dark, retro, neon)
 */
export type ThemeName = 'light' | 'dark' | 'retro' | 'neon';
export interface ThemeConfig {
    name: ThemeName;
    label: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        foreground: string;
        accent: string;
    };
}
/**
 * Theme configurations
 */
export declare const THEMES: Record<ThemeName, ThemeConfig>;
/**
 * Default theme
 */
export declare const DEFAULT_THEME: ThemeName;
/**
 * LocalStorage key for theme preference
 */
export declare const THEME_STORAGE_KEY = "theme";
/**
 * Get current theme from localStorage
 */
export declare function getStoredTheme(): ThemeName;
/**
 * Store theme preference in localStorage
 */
export declare function setStoredTheme(theme: ThemeName): void;
/**
 * Apply theme to document (adds data-theme attribute)
 */
export declare function applyTheme(theme: ThemeName): void;
/**
 * Get theme config by name
 */
export declare function getThemeConfig(theme: ThemeName): ThemeConfig;
/**
 * Get all available themes
 */
export declare function getAllThemes(): ThemeConfig[];
/**
 * Cycle to next theme (useful for keyboard shortcut)
 */
export declare function getNextTheme(current: ThemeName): ThemeName;
