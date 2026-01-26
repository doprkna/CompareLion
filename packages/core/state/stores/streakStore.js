/**
 * Streak Store
 * Zustand store for streak state with localStorage persistence
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
'use client';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { updateStreak, getStreakData, getStreakMessage } from '../../hooks/streak'; // sanity-fix
import { toast } from 'sonner';
export const useStreakStore = create()(persist((set, get) => ({
    streak: null,
    loading: true,
    recordActivity: () => {
        const result = updateStreak();
        set({ streak: result.streak });
        // Show toast message (preserve side effects)
        const message = getStreakMessage(result.streak.currentStreak, result.isNewStreak, result.wasBroken);
        if (result.wasBroken) {
            toast.error(message);
        }
        else if (result.isNewStreak) {
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
}), {
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
}));
