/**
 * Flow Reward Store
 * Zustand store for flow reward screen state
 * v0.41.17 - C3 Step 18: State Migration Batch #1
 */
'use client';
import { createStore } from '../factory';
export const useFlowRewardStore = createStore((set) => ({
    isOpen: false,
    rewardData: null,
    triggerFlowReward: (data) => {
        set({ rewardData: data, isOpen: true });
    },
    close: () => {
        set({ isOpen: false });
        // Delay clearing data to allow exit animation
        setTimeout(() => {
            set({ rewardData: null });
        }, 300);
    },
}));
