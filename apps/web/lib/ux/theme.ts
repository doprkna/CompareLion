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
export const THEMES: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'light',
    label: 'Light',
    description: 'Clean and bright',
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#8b5cf6', // purple-500
      background: '#ffffff',
      foreground: '#0f172a', // slate-900
      accent: '#10b981', // green-500
    },
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes',
    colors: {
      primary: '#60a5fa', // blue-400
      secondary: '#a78bfa', // purple-400
      background: '#0f172a', // slate-900
      foreground: '#f1f5f9', // slate-100
      accent: '#34d399', // green-400
    },
  },
  retro: {
    name: 'retro',
    label: 'Retro',
    description: 'Vintage vibes',
    colors: {
      primary: '#eab308', // yellow-500
      secondary: '#f97316', // orange-500
      background: '#292524', // stone-800
      foreground: '#fef3c7', // amber-100
      accent: '#facc15', // yellow-400
    },
  },
  neon: {
    name: 'neon',
    label: 'Neon',
    description: 'Electric and vibrant',
    colors: {
      primary: '#ec4899', // pink-500
      secondary: '#8b5cf6', // purple-500
      background: '#1e1b4b', // indigo-950
      foreground: '#fae8ff', // fuchsia-50
      accent: '#06b6d4', // cyan-500
    },
  },
};

/**
 * Default theme
 */
export const DEFAULT_THEME: ThemeName = 'dark';

/**
 * LocalStorage key for theme preference
 */
export const THEME_STORAGE_KEY = 'theme';

/**
 * Get current theme from localStorage
 */
export function getStoredTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && stored in THEMES) {
      return stored as ThemeName;
    }
  } catch (err) {
    console.error('Failed to read theme from localStorage:', err);
  }

  return DEFAULT_THEME;
}

/**
 * Store theme preference in localStorage
 */
export function setStoredTheme(theme: ThemeName): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.error('Failed to store theme in localStorage:', err);
  }
}

/**
 * Apply theme to document (adds data-theme attribute)
 */
export function applyTheme(theme: ThemeName): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('data-theme', theme);
  
  // Also set class for Tailwind dark mode
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Get theme config by name
 */
export function getThemeConfig(theme: ThemeName): ThemeConfig {
  return THEMES[theme];
}

/**
 * Get all available themes
 */
export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEMES);
}

/**
 * Cycle to next theme (useful for keyboard shortcut)
 */
export function getNextTheme(current: ThemeName): ThemeName {
  const themeNames: ThemeName[] = ['light', 'dark', 'retro', 'neon'];
  const currentIndex = themeNames.indexOf(current);
  const nextIndex = (currentIndex + 1) % themeNames.length;
  return themeNames[nextIndex];
}







