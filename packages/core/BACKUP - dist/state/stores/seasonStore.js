/**
 * Season Store
 * Zustand store for season data with user progress (multi-source aggregation)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
export const useSeasonStore = createAsyncStore({
    name: 'season',
    fetcher: async () => {
        const response = await defaultClient.get('/meta/season', {
            cache: 'no-store',
        });
        return response.data;
    },
    cacheTtl: 2 * 60 * 1000, // 2 minutes (shorter TTL for dynamic data)
});
