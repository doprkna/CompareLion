/**
 * Lore Store
 * Zustand store for lore entries collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
export const useLoreStore = createAsyncStore({
    name: 'lore',
    fetcher: async (page = 1, limit = 20) => {
        const response = await defaultClient.get(`/lore/all?page=${page}&limit=${limit}`);
        // API returns { entries, pagination } directly in data
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
