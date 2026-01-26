/**
 * Rituals Store
 * Zustand store for ritual data with user progress (multi-source aggregation, read-only)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
export const useRitualsStore = createAsyncStore({
    name: 'rituals',
    fetcher: async () => {
        const response = await defaultClient.get('/rituals/today', {
            cache: 'no-store',
        });
        return response.data;
    },
    cacheTtl: 2 * 60 * 1000, // 2 minutes (shorter TTL for daily ritual)
});
