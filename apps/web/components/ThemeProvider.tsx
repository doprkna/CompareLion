'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ThemeManager } from './ThemeManager';
import { getThemeByKey } from '@/lib/themes';

interface ThemeContextType {
  theme: string;
  themeKey: string;
  setTheme: (themeId: string) => void;
  applyTheme: (themeKey: string) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  themeKey: 'default',
  setTheme: () => {},
  applyTheme: async () => {},
  loading: false,
});

export function useTheme() {
  return useContext(ThemeContext);
}

const FALLBACK_THEME = 'default';

/**
 * ThemeProvider - v0.29.11
 * Loads theme from user settings or localStorage, syncs with backend
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('default');
  const [themeKey, setThemeKey] = useState('default');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load theme from user settings or localStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try to load from user settings first (via theme API or user profile)
        const res = await fetch('/api/user/settings/roast', { cache: 'no-store' }).catch(() => null);
        if (res?.ok) {
          // Alternative: fetch from a settings endpoint that includes themeKey
          // For now, fallback to localStorage
        }
      } catch (e) {
        // Fallback to localStorage
      }

      // Fallback to localStorage (or user settings if available)
      const saved = localStorage.getItem('parel-theme');
      if (saved) {
        const themeObj = getThemeByKey(saved);
        if (themeObj) {
          setThemeState(themeObj.id);
          setThemeKey(saved);
        } else {
          setThemeState(FALLBACK_THEME);
          setThemeKey(FALLBACK_THEME);
        }
      } else {
        setThemeState(FALLBACK_THEME);
        setThemeKey(FALLBACK_THEME);
      }
    };

    loadTheme();
    setMounted(true);
  }, []);

  const setTheme = (themeId: string) => {
    const themeObj = getThemeByKey(themeId);
    if (themeObj) {
      setThemeState(themeObj.id);
      setThemeKey(themeObj.key || themeObj.id);
      localStorage.setItem('parel-theme', themeObj.key || themeObj.id);
    }
  };

  const applyTheme = useCallback(async (newThemeKey: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/themes/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeKey: newThemeKey }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const themeObj = getThemeByKey(newThemeKey);
          if (themeObj) {
            setThemeState(themeObj.id);
            setThemeKey(newThemeKey);
            localStorage.setItem('parel-theme', newThemeKey);
          }
        }
      }
    } catch (e) {
      console.error('Failed to apply theme:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setTheme, applyTheme, loading }}>
      <ThemeManager themeId={theme} />
      {children}
    </ThemeContext.Provider>
  );
}



