/**
 * Streak Store
 * Zustand store for streak state with localStorage persistence
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
'use client';
import { createStore } from '../factory';
import { updateStreak, getStreakMessage } from '../../hooks/streak';
// Local stub for sonner (missing dependency)
const toast = { success: (_) => { }, error: (_) => { }, info: (_) => { } };
export const useStreakStore = createStore((set) => ({
    streak: null,
    loading: true,
    recordActivity: () => {
        const result = updateStreak();
        set({ streak: result.streak });
        const message = getStreakMessage(result.streak.currentStreak, result.isNewStreak, result.wasBroken);
        if (result.wasBroken) {
            toast.error(message);
        }
        else if (result.isNewStreak) {
            toast.success(message);
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('streakUpdated', { detail: result.streak }));
        }
        return result;
    },
    reset: () => {
        set({ streak: null, loading: false });
    },
}));
