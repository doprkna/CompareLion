import { ThemeName, type ThemeConfig } from './theme';
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
