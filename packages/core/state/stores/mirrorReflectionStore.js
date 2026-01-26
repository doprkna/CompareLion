/**
 * Mirror Reflection Store
 * Zustand store for event participation mutation state
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
'use client';
import { createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
export const useSubmitMirrorReflectionStore = createStore((set, get) => ({
    loading: false,
    error: null,
    submit: async (mirrorEventId, answers) => {
        set({ loading: true, error: null });
        try {
            const response = await defaultClient.post('/mirror-events/submit', {
                mirrorEventId,
                answers,
            });
            set({ loading: false });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit reflection';
            set({ loading: false, error: errorMessage });
            throw error;
        }
    },
}));
