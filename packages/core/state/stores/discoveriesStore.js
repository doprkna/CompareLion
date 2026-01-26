/**
 * Discoveries Store
 * Zustand store for item discoveries collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
export const useDiscoveriesStore = createAsyncStore({
    name: 'discoveries',
    fetcher: async () => {
        const response = await defaultClient.get('/items/discoveries');
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
