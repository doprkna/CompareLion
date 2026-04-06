import { ReactNode } from 'react';
interface ThemeContextType {
    theme: string;
    themeKey: string;
    setTheme: (themeId: string) => void;
    applyTheme: (themeKey: string) => Promise<void>;
    loading: boolean;
}
export declare function useTheme(): ThemeContextType;
/**
 * ThemeProvider - v0.29.11
 * Loads theme from user settings or localStorage, syncs with backend
 */
export declare function ThemeProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element | null;
export {};
