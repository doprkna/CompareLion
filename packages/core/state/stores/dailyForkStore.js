/**
 * Daily Fork Store
 * Zustand store for story choice state container (read + mutation)
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
'use client';
import { createAsyncStore, createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
// Read-only fork store
export const useDailyForkStore = createAsyncStore({
    name: 'dailyFork',
    fetcher: async () => {
        const response = await defaultClient.get('/forks/today', {
            cache: 'no-store',
        });
        return response.data;
    },
    cacheTtl: 2 * 60 * 1000, // 2 minutes (daily fork)
});
export const useChooseForkStore = createStore((set, get) => ({
    loading: false,
    error: null,
    choose: async (forkId, choice) => {
        set({ loading: true, error: null });
        try {
            const response = await defaultClient.post('/forks/choose', { forkId, choice });
            set({ loading: false });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to make choice';
            set({ loading: false, error: errorMessage });
            throw error;
        }
    },
}));
