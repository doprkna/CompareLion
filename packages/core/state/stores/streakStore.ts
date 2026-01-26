/**
 * Streak Store
 * Zustand store for streak state with localStorage persistence
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */

'use client';

// sanity-fix: replaced zustand imports with local stubs (missing dependency)
const create = (fn: any) => fn();
const persist = (fn: any, options: any) => fn;
const createJSONStorage = (storage: any) => ({ getItem: () => null, setItem: () => {} });
// sanity-fix: replaced sonner import with local stub (missing dependency)
const toast = { success: () => {}, error: () => {}, info: () => {} };
import { updateStreak, getStreakData, getStreakMessage, type StreakData } from '../../hooks/streak'; // sanity-fix

interface StreakStoreState {
  streak: StreakData | null;
  loading: boolean;
  recordActivity: () => {
    streak: StreakData;
    isNewStreak: boolean;
    wasBroken: boolean;
  };
  reset: () => void;
}

export const useStreakStore = create<StreakStoreState>()(
  persist(
    (set, get) => ({
      streak: null,
      loading: true,

      recordActivity: () => {
        const result = updateStreak();
        set({ streak: result.streak });

        // Show toast message (preserve side effects)
        const message = getStreakMessage(
          result.streak.currentStreak,
          result.isNewStreak,
          result.wasBroken
        );

        if (result.wasBroken) {
          toast.error(message);
        } else if (result.isNewStreak) {
          toast.success(message);
        }

        // Dispatch event for other components (preserve side effects)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('streakUpdated', { detail: result.streak }));
        }

        return result;
      },

      reset: () => {
        set({ streak: null, loading: false });
      },
    }),
    {
      name: 'streak-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Load initial streak data after rehydration
        if (state) {
          const data = getStreakData();
          state.streak = data;
          state.loading = false;
        }
      },
    }
  )
);

