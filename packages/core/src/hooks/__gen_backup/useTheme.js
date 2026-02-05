'use client';
// sanity-fix
/**
 * useTheme Hook
 * v0.34.5 - Theme management with localStorage persistence
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_THEME, getStoredTheme, setStoredTheme, applyTheme, getThemeConfig, getAllThemes, getNextTheme, } from './theme'; // sanity-fix
/**
 * Hook for theme management
 */
export function useTheme() {
    const [theme, setThemeState] = useState(DEFAULT_THEME);
    // Initialize theme from localStorage
    useEffect(() => {
        const stored = getStoredTheme();
        setThemeState(stored);
        applyTheme(stored);
    }, []);
    // Set theme and persist to localStorage
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        setStoredTheme(newTheme);
        applyTheme(newTheme);
    }, []);
    // Toggle to next theme
    const toggleTheme = useCallback(() => {
        const next = getNextTheme(theme);
        setTheme(next);
    }, [theme, setTheme]);
    return {
        theme,
        themeConfig: getThemeConfig(theme),
        setTheme,
        toggleTheme,
        availableThemes: getAllThemes(),
    };
}
