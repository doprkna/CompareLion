'use client';
import { useCallback, useEffect, useState } from 'react';
import { getMusicThemes, findThemeByMood, findThemeByRegion, findThemeByArchetype } from '../config/musicThemes'; // sanity-fix
export function useMusicTheme() {
    const [themes, setThemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const themesData = await getMusicThemes();
            setThemes(themesData);
        }
        catch (e) {
            setError(e?.message || 'Failed to load music themes');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const getThemeByMood = useCallback((moodTag) => {
        return findThemeByMood(moodTag);
    }, []);
    const getThemeByRegion = useCallback((regionKey) => {
        return findThemeByRegion(regionKey);
    }, []);
    const getThemeByArchetype = useCallback((archetypeKey) => {
        return findThemeByArchetype(archetypeKey);
    }, []);
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
