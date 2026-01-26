'use client';

import { useCallback, useEffect, useState } from 'react';
import { MusicTheme, getMusicThemes, findThemeByMood, findThemeByRegion, findThemeByArchetype } from '../config/musicThemes'; // sanity-fix

export function useMusicTheme() {
  const [themes, setThemes] = useState<MusicTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const themesData = await getMusicThemes();
      setThemes(themesData);
    } catch (e: any) {
      setError(e?.message || 'Failed to load music themes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getThemeByMood = useCallback((moodTag: 'calm' | 'chaos' | 'joy' | 'deep' | 'battle') => {
    return findThemeByMood(themes, moodTag);
  }, [themes]);

  const getThemeByRegion = useCallback((regionKey: string) => {
    return findThemeByRegion(themes, regionKey);
  }, [themes]);

  const getThemeByArchetype = useCallback((archetypeKey: string) => {
    return findThemeByArchetype(themes, archetypeKey);
  }, [themes]);

  return {
    themes,
    loading,
    error,
    getThemeByMood,
    getThemeByRegion,
    getThemeByArchetype,
    reload: load,
  };
}

