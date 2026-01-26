/**
 * Discoveries Store
 * Zustand store for item discoveries collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */

'use client';

import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface Discovery {
  id: string;
  itemId: string;
  item: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    description: string | null;
    icon: string | null;
    emoji: string | null;
    category: string | null;
  };
  discoveredAt: string;
}

interface DiscoveriesData {
  discoveries: Discovery[];
  total: number;
  limit: number;
  offset: number;
}

export const useDiscoveriesStore = createAsyncStore<DiscoveriesData>({
  name: 'discoveries',
  fetcher: async () => {
    const response = await defaultClient.get<DiscoveriesData>('/items/discoveries');
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

