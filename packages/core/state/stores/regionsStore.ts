/**
 * Regions Store
 * Zustand store for regions collection with active region selection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */

'use client';

import { createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
import type { AsyncState } from '../types';

export interface Region {
  id: string;
  key: string;
  name: string;
  description: string;
  orderIndex: number;
  buffType: 'xp' | 'gold' | 'mood' | 'reflection';
  buffValue: number;
  unlockRequirementType?: 'level' | 'task' | 'gold' | 'achievement' | null;
  unlockRequirementValue?: string | null;
  isActive?: boolean;
  isUnlocked?: boolean;
  canUnlock?: boolean;
}

interface RegionsData {
  regions: Region[];
  activeRegionId: string | null;
}

interface RegionsStoreState {
  state: AsyncState<RegionsData>;
  load: () => Promise<void>;
  reload: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

export const useRegionsStore = createStore<RegionsStoreState>((set, get) => ({
  state: {
    data: null,
    loading: false,
    error: null,
  },

  load: async () => {
    set({ state: { ...get().state, loading: true, error: null } });

    try {
      const response = await defaultClient.get<RegionsData>('/regions');
      set({
        state: {
          data: response.data,
          loading: false,
          error: null,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      set({
        state: {
          ...get().state,
          loading: false,
          error: errorMessage,
        },
      });
    }
  },

  reload: async () => {
    await get().load();
  },

  reset: () => {
    set({
      state: {
        data: null,
        loading: false,
        error: null,
      },
    });
  },

  clearError: () => {
    set({
      state: {
        ...get().state,
        error: null,
      },
    });
  },
}));

