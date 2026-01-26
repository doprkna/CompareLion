/**
 * Flow Reward Store
 * Zustand store for flow reward screen state
 * v0.41.17 - C3 Step 18: State Migration Batch #1
 */

'use client';

import { createStore } from '../factory';
import type { FlowRewardData } from '../../hooks/FlowRewardScreen'; // sanity-fix

interface FlowRewardState {
  isOpen: boolean;
  rewardData: FlowRewardData | null;
  triggerFlowReward: (data: FlowRewardData) => void;
  close: () => void;
}

export const useFlowRewardStore = createStore<FlowRewardState>((set) => ({
  isOpen: false,
  rewardData: null,

  triggerFlowReward: (data: FlowRewardData) => {
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

