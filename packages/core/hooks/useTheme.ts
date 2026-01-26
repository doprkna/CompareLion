'use client';
// sanity-fix
/**
 * useTheme Hook
 * v0.34.5 - Theme management with localStorage persistence
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ThemeName,
  DEFAULT_THEME,
  getStoredTheme,
  setStoredTheme,
  applyTheme,
  getThemeConfig,
  getAllThemes,
  getNextTheme,
  type ThemeConfig,
} from './theme'; // sanity-fix

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
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  // Set theme and persist to localStorage
  const setTheme = useCallback((newTheme: ThemeName) => {
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






