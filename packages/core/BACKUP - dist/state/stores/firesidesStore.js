/**
 * Firesides Store
 * Zustand store for firesides collection and individual fireside with reactions (nested DTOs)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */
'use client';
import { createAsyncStore, createResourceStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
// Firesides list store
export const useFiresidesStore = createAsyncStore({
    name: 'firesides',
    fetcher: async () => {
        const response = await defaultClient.get('/firesides', {
            cache: 'no-store',
        });
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
// Individual fireside store (resource store by ID)
export const useFiresideStore = createResourceStore({
    name: 'fireside',
    fetcher: async (id) => {
        const response = await defaultClient.get(`/firesides/${id}`, {
            cache: 'no-store',
        });
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
