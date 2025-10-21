'use client';

import { useEffect } from 'react';
import { getTheme, mergeColors, type Theme } from '@/lib/themes';

interface ThemeManagerProps {
  themeId: string;
}

/**
 * ThemeManager - Applies theme colors and patterns to the document
 * Updates CSS custom properties dynamically
 */
export function ThemeManager({ themeId }: ThemeManagerProps) {
  useEffect(() => {
    const theme = getTheme(themeId);
    const colors = mergeColors(theme.colors);

    // Apply colors as CSS custom properties
    const root = document.documentElement;
    
    root.style.setProperty('--color-bg', colors.bg);
    root.style.setProperty('--color-card', colors.card);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-subtle', colors.subtle);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-success', colors.success || '#16a34a');
    root.style.setProperty('--color-warning', colors.warning || '#ea580c');
    root.style.setProperty('--color-destructive', colors.destructive || '#dc2626');

    // Apply background pattern
    if (theme.pattern && theme.pattern !== 'none') {
      root.style.setProperty('--bg-pattern', theme.pattern);
      document.body.style.background = theme.pattern;
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      root.style.removeProperty('--bg-pattern');
      document.body.style.background = colors.bg;
    }

    // Store theme preference
    localStorage.setItem('parel-theme', themeId);
  }, [themeId]);

  return null; // This component doesn't render anything
}










