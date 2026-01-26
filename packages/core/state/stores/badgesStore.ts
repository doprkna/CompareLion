/**
 * Badges Store
 * Zustand store for badges collections with computed selectors
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */

'use client';

import { createAsyncStore, createCollectionStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface Badge {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'eternal';
  unlockType: 'level' | 'event' | 'season' | 'special';
  requirementValue?: string | null;
  rewardType?: 'currency' | 'item' | 'title' | null;
  rewardValue?: string | null;
  seasonId?: string | null;
  isUnlocked?: boolean;
  unlockedAt?: string;
  claimedAt?: string | null;
  isClaimed?: boolean;
  canClaim?: boolean;
  userBadgeId?: string; // UserBadge.id for claiming rewards
}

interface BadgesData {
  badges: Badge[];
}

// All badges store
export const useBadgesStore = createAsyncStore<BadgesData>({
  name: 'badges',
  fetcher: async (unlocked?: boolean) => {
    const params = unlocked !== undefined ? `?unlocked=${unlocked}` : '';
    const response = await defaultClient.get<BadgesData>(`/badges${params}`);
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

// User badges store with computed selectors
// We'll use createAsyncStore and add computed selectors in the hook
export const useUserBadgesStore = createAsyncStore<BadgesData>({
  name: 'userBadges',
  fetcher: async () => {
    const response = await defaultClient.get<BadgesData>('/badges/user');
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

