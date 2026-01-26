'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useGlobalMood() {
    const [mood, setMood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/moods/global', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load global mood');
            setMood(json?.mood || null); // sanity-fix
        }
        catch (e) {
            setError(e?.message || 'Failed to load global mood');
            // Fallback to calm if error
            setMood({
                dominantEmotion: 'calm',
                scoreJoy: 0,
                scoreSad: 0,
                scoreAnger: 0,
                scoreCalm: 1.0,
                updatedAt: new Date().toISOString(),
                isDefault: true,
            });
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            load();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [load]);
    return { mood, loading, error, reload: load };
}
export function useMoodTheme(mood) {
    const getThemeColors = useCallback(() => {
        if (!mood || !mood.dominantEmotion) {
            return {
                primary: '#4a90e2',
                secondary: '#7bc8a4',
                gradient: 'from-blue-400 to-green-400',
            };
        }
        const themeMap = {
            joy: {
                primary: '#fbbf24',
                secondary: '#f59e0b',
                gradient: 'from-yellow-400 to-orange-400',
                emoji: '😊',
            },
            sad: {
                primary: '#6b7280',
                secondary: '#4b5563',
                gradient: 'from-gray-400 to-gray-600',
                emoji: '😢',
            },
            anger: {
                primary: '#ef4444',
                secondary: '#dc2626',
                gradient: 'from-red-500 to-red-700',
                emoji: '😠',
            },
            calm: {
                primary: '#10b981',
                secondary: '#059669',
                gradient: 'from-green-400 to-emerald-500',
                emoji: '🌿',
            },
            chaos: {
                primary: '#8b5cf6',
                secondary: '#7c3aed',
                gradient: 'from-purple-500 to-indigo-600',
                emoji: '🌀',
            },
            hope: {
                primary: '#3b82f6',
                secondary: '#2563eb',
                gradient: 'from-blue-400 to-blue-600',
                emoji: '✨',
            },
        };
        return themeMap[mood.dominantEmotion] || themeMap.calm;
    }, [mood]);
    const getMoodText = useCallback(() => {
        if (!mood || !mood.dominantEmotion)
            return 'World feels calm today 🌿';
        const textMap = {
            joy: 'World feels joyful today 😊',
            sad: 'World feels melancholic today 😢',
            anger: 'World feels tense today 😠',
            calm: 'World feels calm today 🌿',
            chaos: 'World feels chaotic today 🌀',
            hope: 'World feels hopeful today ✨',
        };
        return textMap[mood.dominantEmotion] || 'World feels calm today 🌿';
    }, [mood]);
    return {
        theme: getThemeColors(),
        moodText: getMoodText(),
        dominantEmotion: mood?.dominantEmotion || 'calm',
    };
}