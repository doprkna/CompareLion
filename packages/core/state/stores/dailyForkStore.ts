/**
 * Daily Fork Store
 * Zustand store for story choice state container (read + mutation)
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */

'use client';

import { createAsyncStore, createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

interface Fork {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  [key: string]: any; // Allow additional fork properties
}

interface UserChoice {
  forkId: string;
  choice: 'A' | 'B';
  chosenAt: string;
  [key: string]: any; // Allow additional choice properties
}

interface DailyForkData {
  fork: Fork | null;
  userChoice: UserChoice | null;
}

// Read-only fork store
export const useDailyForkStore = createAsyncStore<DailyForkData>({
  name: 'dailyFork',
  fetcher: async () => {
    const response = await defaultClient.get<DailyForkData>('/forks/today', {
      cache: 'no-store',
    });
    return response.data;
  },
  cacheTtl: 2 * 60 * 1000, // 2 minutes (daily fork)
});

// Choose fork mutation store
interface ChooseForkStoreState {
  loading: boolean;
  error: string | null;
  choose: (forkId: string, choice: 'A' | 'B') => Promise<any>;
}

export const useChooseForkStore = createStore<ChooseForkStoreState>((set, get) => ({
  loading: false,
  error: null,

  choose: async (forkId: string, choice: 'A' | 'B') => {
    set({ loading: true, error: null });
    try {
      const response = await defaultClient.post('/forks/choose', { forkId, choice });
      set({ loading: false });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to make choice';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
}));

