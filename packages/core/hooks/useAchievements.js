'use client';
// sanity-fix
/**
 * useAchievements Hook
 * Fetches achievements with unlock status, provides unlock function
 * v0.26.0 - Achievements Awakened
 * v0.41.13 - Migrated GET call to unified API client
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix
import { useRewardToast } from './useRewardToast'; // sanity-fix
export function useAchievements() {
    const [achievements, setAchievements] = useState([]);
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { pushToast } = useRewardToast();
    const fetchAchievements = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch grouped by categories
            const response = await defaultClient.get('/achievements?categories=true');
            // Handle 401 gracefully (v0.35.7)
            if (response?.response?.status === 401) { // sanity-fix
                setError('Authentication required. Please log in.');
                return;
            }
            const achievementsData = response?.data?.achievements; // sanity-fix
            // If grouped by category, achievementsData is Record<string, AchievementDTO[]>
            if (achievementsData && typeof achievementsData === 'object' && !Array.isArray(achievementsData)) { // sanity-fix
                // Flatten categories into single array
                const allAchievements = Object.values(achievementsData).flat();
                setAchievements(allAchievements);
                setCategories(achievementsData);
            }
            else {
                // If flat list, achievementsData is AchievementDTO[]
                setAchievements(achievementsData);
                setCategories({});
            }
        }
        catch (err) {
            const errorMessage = err instanceof ApiClientError
                ? err.message
                : err instanceof Error
                    ? err.message
                    : 'Network error';
            setError(errorMessage);
            console.error('[useAchievements] Fetch error:', err);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);
    const unlockAchievement = useCallback(async (key, tier = 1) => {
        try {
            const res = await fetch('/api/achievements/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, tier }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.unlocked && data.achievement) {
                    // Show toast notification
                    const achievement = data.achievement;
                    const emoji = achievement.emoji || achievement.icon || '🏅';
                    const name = achievement.name || achievement.title;
                    const xpReward = achievement.xpReward || 0;
                    const goldReward = achievement.goldReward || 0;
                    let message = `${emoji} ${name} unlocked!`;
                    if (xpReward > 0 || goldReward > 0) {
                        const rewards = [];
                        if (xpReward > 0)
                            rewards.push(`+${xpReward} XP`);
                        if (goldReward > 0)
                            rewards.push(`+${goldReward} gold`);
                        message += ` (${rewards.join(', ')})`;
                    }
                    pushToast({
                        type: 'achievement',
                        message,
                    });
                }
                // Refetch to update UI
                await fetchAchievements();
                return true;
            }
            else {
                console.error('[useAchievements] Unlock failed:', data.error);
                return false;
            }
        }
        catch (err) {
            console.error('[useAchievements] Unlock error:', err);
            return false;
        }
    }, [fetchAchievements, pushToast]);
    return {
        achievements,
        categories,
        loading,
        error,
        unlockAchievement,
        refetch: fetchAchievements,
    };
}