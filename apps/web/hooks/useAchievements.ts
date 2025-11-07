/**
 * useAchievements Hook
 * Fetches achievements with unlock status, provides unlock function
 * v0.26.0 - Achievements Awakened
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRewardToast } from '@/hooks/useRewardToast';

export interface Achievement {
  id: string;
  key: string | null;
  code: string;
  category: string;
  tier: number;
  title: string;
  name: string | null;
  description: string;
  emoji: string | null;
  icon: string | null;
  xpReward: number;
  rewardXp: number | null;
  rewardGold: number;
  unlocked: boolean;
  unlockedTier: number | null;
  unlockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UseAchievementsReturn {
  achievements: Achievement[];
  categories: Record<string, Achievement[]>;
  loading: boolean;
  error: string | null;
  unlockAchievement: (key: string, tier?: number) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useAchievements(): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [categories, setCategories] = useState<Record<string, Achievement[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useRewardToast();

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch grouped by categories
      const res = await fetch('/api/achievements?categories=true');
      const data = await res.json();

      if (data.success && data.achievements) {
        // Flatten categories into single array
        const allAchievements: Achievement[] = Object.values(data.achievements).flat() as Achievement[];
        setAchievements(allAchievements);
        setCategories(data.achievements);
      } else {
        setError(data.error || 'Failed to fetch achievements');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      console.error('[useAchievements] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const unlockAchievement = useCallback(async (key: string, tier: number = 1): Promise<boolean> => {
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
            if (xpReward > 0) rewards.push(`+${xpReward} XP`);
            if (goldReward > 0) rewards.push(`+${goldReward} gold`);
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
      } else {
        console.error('[useAchievements] Unlock failed:', data.error);
        return false;
      }
    } catch (err) {
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

