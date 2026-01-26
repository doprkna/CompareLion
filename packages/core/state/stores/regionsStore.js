/**
 * Regions Store
 * Zustand store for regions collection with active region selection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
'use client';
import { createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
export const useRegionsStore = createStore((set, get) => ({
    state: {
        data: null,
        loading: false,
        error: null,
    },
    load: async () => {
        set({ state: { ...get().state, loading: true, error: null } });
        try {
            const response = await defaultClient.get('/regions');
            set({
                state: {
                    data: response.data,
                    loading: false,
                    error: null,
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            set({
                state: {
                    ...get().state,
                    loading: false,
                    error: errorMessage,
                },
            });
        }
    },
    reload: async () => {
        await get().load();
    },
    reset: () => {
        set({
            state: {
                data: null,
                loading: false,
                error: null,
            },
        });
    },
    clearError: () => {
        set({
            state: {
                ...get().state,
                error: null,
            },
        });
    },
}));
