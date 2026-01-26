/**
 * Chronicle Store
 * Zustand store for chronicle data with nested stats and season (nested DTOs)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
export const useChronicleStore = createAsyncStore({
    name: 'chronicle',
    fetcher: async (type = 'weekly') => {
        const response = await defaultClient.get(`/chronicles/latest?type=${type}`);
        return response.data;
    },
    cacheTtl: 10 * 60 * 1000, // 10 minutes (chronicles are relatively static)
});
