/**
 * Social Store
 * Zustand store for social interactions (friends, duels, feed, mutations)
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */

'use client';

import { createAsyncStore, createStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface Friend {
  id: string;
  username: string | null;
  name: string | null;
  archetype: string | null;
  level: number;
  avatar: string | null;
  friendshipId: string;
  since: string;
}

export interface Duel {
  id: string;
  challengerId: string;
  opponentId: string;
  challenger?: {
    id: string;
    username: string | null;
    level: number;
  };
  opponent?: {
    id: string;
    username: string | null;
    level: number;
  };
  status: 'pending' | 'active' | 'completed' | 'expired';
  challengeType: 'xp' | 'reflection' | 'random' | 'poll';
  rewardXP: number;
  winnerId?: string | null;
  createdAt: string;
}

export interface FeedItem {
  type: 'badge' | 'duel' | 'quest';
  userId: string;
  username: string;
  data: any;
  timestamp: string;
}

interface FriendsData {
  friends: Friend[];
}

interface DuelsData {
  duels: Duel[];
}

interface SocialFeedData {
  feed: FeedItem[];
}

// Friends store (read-only)
export const useFriendsStore = createAsyncStore<FriendsData>({
  name: 'friends',
  fetcher: async () => {
    const response = await defaultClient.get<FriendsData>('/social/friends');
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

// Duels store (read-only)
export const useDuelsStore = createAsyncStore<DuelsData>({
  name: 'duels',
  fetcher: async () => {
    const response = await defaultClient.get<DuelsData>('/social/duels');
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

// Social feed store (read-only)
export const useSocialFeedStore = createAsyncStore<SocialFeedData>({
  name: 'socialFeed',
  fetcher: async () => {
    const response = await defaultClient.get<SocialFeedData>('/social/feed');
    return response.data;
  },
  cacheTtl: 2 * 60 * 1000, // 2 minutes (more dynamic)
});

// Friend request mutation store
interface FriendRequestStoreState {
  loading: boolean;
  error: string | null;
  sendRequest: (userId: string, action: 'send' | 'accept' | 'decline' | 'block') => Promise<any>;
}

export const useFriendRequestStore = createStore<FriendRequestStoreState>((set, get) => ({
  loading: false,
  error: null,

  sendRequest: async (userId: string, action: 'send' | 'accept' | 'decline' | 'block') => {
    set({ loading: true, error: null });
    try {
      const response = await defaultClient.post('/social/friends/request', { userId, action });
      set({ loading: false });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
}));

// Start duel mutation store
interface StartDuelStoreState {
  loading: boolean;
  error: string | null;
  startDuel: (opponentId: string, type: 'xp' | 'reflection' | 'random' | 'poll') => Promise<any>;
}

export const useStartDuelStore = createStore<StartDuelStoreState>((set, get) => ({
  loading: false,
  error: null,

  startDuel: async (opponentId: string, type: 'xp' | 'reflection' | 'random' | 'poll') => {
    set({ loading: true, error: null });
    try {
      const response = await defaultClient.post('/social/duels/start', { opponentId, type });
      set({ loading: false });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start duel';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },
}));

