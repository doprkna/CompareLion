/**
 * Rarities Store
 * Zustand store for rarities lookup list
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
export const useRaritiesStore = createAsyncStore({
    name: 'rarities',
    fetcher: async () => {
        const response = await defaultClient.get('/rarities', {
            cache: 'no-store',
        });
        return response.data;
    },
    cacheTtl: 10 * 60 * 1000, // 10 minutes (static lookup data)
});
