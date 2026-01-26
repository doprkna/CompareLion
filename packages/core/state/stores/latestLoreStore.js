/**
 * Latest Lore Store
 * Zustand store for latest lore entries collection
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
export const useLatestLoreStore = createAsyncStore({
    name: 'latestLore',
    fetcher: async () => {
        const response = await defaultClient.get('/lore/latest');
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
