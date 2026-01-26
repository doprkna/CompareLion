/**
 * Badges Store
 * Zustand store for badges collections with computed selectors
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
// All badges store
export const useBadgesStore = createAsyncStore({
    name: 'badges',
    fetcher: async (unlocked) => {
        const params = unlocked !== undefined ? `?unlocked=${unlocked}` : '';
        const response = await defaultClient.get(`/badges${params}`);
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
// User badges store with computed selectors
// We'll use createAsyncStore and add computed selectors in the hook
export const useUserBadgesStore = createAsyncStore({
    name: 'userBadges',
    fetcher: async () => {
        const response = await defaultClient.get('/badges/user');
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
