'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { getAllThemes, REGION_THEMES } from '@/lib/themes';
import { Palette, Check, Loader2 } from 'lucide-react';

/**
 * ThemeSwitcher Component
 * v0.29.11 - Visual Identity & Theme Pass
 */
export function ThemeSwitcher() {
  const { themeKey, applyTheme, loading } = useTheme();
  const [themes, setThemes] = useState<any[]>([]);

  useEffect(() => {
    const allThemes = getAllThemes();
    setThemes(allThemes);
  }, []);

  const regionThemes = themes.filter((t) => t.region);
  const otherThemes = themes.filter((t) => !t.region);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Theme Selection
        </CardTitle>
        <CardDescription>Choose your visual identity and region-based themes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Region-based Themes */}
        {regionThemes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Region Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {regionThemes.map((theme) => {
                const isActive = themeKey === theme.key;
                const colors = theme.colors || {};

                return (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme.key)}
                    disabled={loading || isActive}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-accent shadow-lg shadow-accent/30'
                        : 'border-border hover:border-accent/50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                      background: theme.pattern || colors.bg || '#1e293b',
                      color: colors.text || '#f1f5f9',
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {theme.emoji && <span className="text-2xl">{theme.emoji}</span>}
                      <span className="text-xs font-semibold">{theme.name}</span>
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                      )}
                      {loading && themeKey === theme.key && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Themes */}
        {otherThemes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Additional Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {otherThemes.slice(0, 8).map((theme) => {
                const isActive = themeKey === theme.key;
                const colors = theme.colors || {};

                return (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme.key)}
                    disabled={loading || isActive}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'border-accent shadow-lg shadow-accent/30'
                        : 'border-border hover:border-accent/50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                      background: theme.pattern || colors.bg || '#1e293b',
                      color: colors.text || '#f1f5f9',
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {theme.emoji && <span className="text-2xl">{theme.emoji}</span>}
                      <span className="text-xs font-semibold">{theme.name}</span>
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-4 h-4 text-accent" />
                        </div>
                      )}
                      {loading && themeKey === theme.key && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

