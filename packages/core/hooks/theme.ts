// sanity-fix: Minimal theme utilities stub for packages/core
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

export const DEFAULT_THEME: ThemeName = 'auto';

const THEMES: ThemeConfig[] = [
  { name: 'light', label: 'Light', colors: { primary: '#000', background: '#fff', text: '#000' } },
  { name: 'dark', label: 'Dark', colors: { primary: '#fff', background: '#000', text: '#fff' } },
  { name: 'auto', label: 'Auto', colors: { primary: '#000', background: '#fff', text: '#000' } },
];

export function getStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem('theme') as ThemeName | null;
  return stored && ['light', 'dark', 'auto'].includes(stored) ? stored : DEFAULT_THEME;
}

export function setStoredTheme(theme: ThemeName): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', theme);
}

export function applyTheme(theme: ThemeName): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const effectiveTheme = theme === 'auto' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  root.setAttribute('data-theme', effectiveTheme);
}

export function getThemeConfig(theme: ThemeName): ThemeConfig {
  return THEMES.find(t => t.name === theme) || THEMES[0];
}

export function getAllThemes(): ThemeConfig[] {
  return THEMES;
}

export function getNextTheme(currentTheme: ThemeName): ThemeName {
  const index = THEMES.findIndex(t => t.name === currentTheme);
  const nextIndex = (index + 1) % THEMES.length;
  return THEMES[nextIndex].name;
}

