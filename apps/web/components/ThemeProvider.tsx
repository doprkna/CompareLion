'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeManager } from './ThemeManager';

interface ThemeContextType {
  theme: string;
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('default');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('parel-theme');
    if (saved) {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  const setTheme = (themeId: string) => {
    setThemeState(themeId);
    localStorage.setItem('parel-theme', themeId);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeManager themeId={theme} />
      {children}
    </ThemeContext.Provider>
  );
}



