/**
 * useTheme Hook
 * v0.34.5 - Theme management with localStorage persistence
 */
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
export interface UseThemeReturn {
    theme: ThemeName;
    themeConfig: ThemeConfig;
    setTheme: (theme: ThemeName) => void;
    toggleTheme: () => void;
    availableThemes: ThemeConfig[];
}
/**
 * Hook for theme management
 */
export declare function useTheme(): UseThemeReturn;
