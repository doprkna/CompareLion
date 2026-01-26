/**
 * Lore Store
 * Zustand store for lore entries collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */

'use client';

import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface LoreEntry {
  id: string;
  sourceType: 'reflection' | 'quest' | 'item' | 'event' | 'system';
  sourceId?: string | null;
  tone: 'serious' | 'comedic' | 'poetic';
  text: string;
  createdAt: string;
}

export interface LorePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LoreEntriesData {
  entries: LoreEntry[];
  pagination: LorePagination;
}

export const useLoreStore = createAsyncStore<LoreEntriesData>({
  name: 'lore',
  fetcher: async (page: number = 1, limit: number = 20) => {
    const response = await defaultClient.get<{ entries: LoreEntry[]; pagination: LorePagination }>(`/lore/all?page=${page}&limit=${limit}`);
    // API returns { entries, pagination } directly in data
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

