/**
 * Social Store
 * Zustand store for social interactions (friends, duels, feed, mutations)
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
'use client';
import { createAsyncStore, createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
// Friends store (read-only)
export const useFriendsStore = createAsyncStore({
    name: 'friends',
    fetcher: async () => {
        const response = await defaultClient.get('/social/friends');
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
// Duels store (read-only)
export const useDuelsStore = createAsyncStore({
    name: 'duels',
    fetcher: async () => {
        const response = await defaultClient.get('/social/duels');
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
// Social feed store (read-only)
export const useSocialFeedStore = createAsyncStore({
    name: 'socialFeed',
    fetcher: async () => {
        const response = await defaultClient.get('/social/feed');
        return response.data;
    },
    cacheTtl: 2 * 60 * 1000, // 2 minutes (more dynamic)
});
export const useFriendRequestStore = createStore((set, get) => ({
    loading: false,
    error: null,
    sendRequest: async (userId, action) => {
        set({ loading: true, error: null });
        try {
            const response = await defaultClient.post('/social/friends/request', { userId, action });
            set({ loading: false });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
            set({ loading: false, error: errorMessage });
            throw error;
        }
    },
}));
export const useStartDuelStore = createStore((set, get) => ({
    loading: false,
    error: null,
    startDuel: async (opponentId, type) => {
        set({ loading: true, error: null });
        try {
            const response = await defaultClient.post('/social/duels/start', { opponentId, type });
            set({ loading: false });
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start duel';
            set({ loading: false, error: errorMessage });
            throw error;
        }
    },
}));
