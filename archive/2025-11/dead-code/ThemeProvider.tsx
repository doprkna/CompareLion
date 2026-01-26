"use client";

import { useEffect } from "react";
import { useRegionStore } from "@/store/useRegionStore";
import { THEMES } from "@/lib/theme/themes";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, region, setTheme } = useRegionStore();

  useEffect(() => {
    // auto-set theme per region if not overridden
    const themeKey = theme as keyof typeof THEMES;
    const regional = THEMES[themeKey] ? themeKey : "default";
    const themeClasses = THEMES[regional];
    
    document.body.className = `${themeClasses.bg} ${themeClasses.text}`;
    
    if (regional !== theme) {
      setTheme(regional);
    }
  }, [theme, region, setTheme]);

  return <>{children}</>;
}

