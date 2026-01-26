/**
 * useTheme Hook
 * v0.34.5 - Theme management with localStorage persistence
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
// TODO: resolve dependency injection after cleaning @parel/core/config
// Theme utilities need to be moved to @parel/core/config or injected as dependencies
// import {
//   ThemeName,
//   DEFAULT_THEME,
//   getStoredTheme,
//   setStoredTheme,
//   applyTheme,
//   getThemeConfig,
//   getAllThemes,
//   getNextTheme,
//   type ThemeConfig,
// } from '@/lib/ux/theme';

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

const DEFAULT_THEME: ThemeName = 'auto';

const THEMES: ThemeConfig[] = [
  { name: 'light', label: 'Light', colors: { primary: '#000', background: '#fff', text: '#000' } },
  { name: 'dark', label: 'Dark', colors: { primary: '#fff', background: '#000', text: '#fff' } },
  { name: 'auto', label: 'Auto', colors: { primary: '#000', background: '#fff', text: '#000' } },
];

function getStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem('theme') as ThemeName | null;
  return stored && ['light', 'dark', 'auto'].includes(stored) ? stored : DEFAULT_THEME;
}

function setStoredTheme(theme: ThemeName): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
}

function applyTheme(theme: ThemeName): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const effectiveTheme = theme === 'auto' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  
  root.setAttribute('data-theme', effectiveTheme);
}

function getThemeConfig(theme: ThemeName): ThemeConfig {
  return THEMES.find(t => t.name === theme) || THEMES[0];
}

function getAllThemes(): ThemeConfig[] {
  return THEMES;
}

function getNextTheme(currentTheme: ThemeName): ThemeName {
  const index = THEMES.findIndex(t => t.name === currentTheme);
  const nextIndex = (index + 1) % THEMES.length;
  return THEMES[nextIndex].name;
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

