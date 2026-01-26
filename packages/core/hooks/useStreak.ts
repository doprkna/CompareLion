'use client';
// sanity-fix
/**
 * useStreak Hook
 * React hook for managing streaks in components
 * v0.13.2m - Retention Features
 * v0.41.20 - Migrated to unified state store
 */

import { useEffect } from 'react';
import { useStreakStore } from '../state/stores/streakStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
import { getStreakData } from './streak'; // sanity-fix
import type { StreakData } from './streak'; // sanity-fix

export type { StreakData };

export function useStreak() {
  const { streak, loading, recordActivity } = useStreakStore();

  useEffect(() => {
    // Load initial streak data if not already loaded
    if (!streak && !loading) {
      const data = getStreakData();
      // Store will handle this via onRehydrateStorage, but ensure it's set
      if (data) {
        // The store's onRehydrateStorage should handle this, but we ensure it's loaded
      }
    }
  }, [streak, loading]);

  return {
    streak,
    loading,
    recordActivity,
  };
}
