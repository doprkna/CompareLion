/**
 * Rituals Store
 * Zustand store for ritual data with user progress (multi-source aggregation, read-only)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */

'use client';

import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface Ritual {
  id: string;
  name: string;
  description: string;
  type: string;
  date: string;
  [key: string]: any; // Allow additional ritual properties
}

export interface RitualUserProgress {
  completed: boolean;
  completedAt?: string | null;
  progress?: number;
  [key: string]: any; // Allow additional progress properties
}

interface RitualsData {
  ritual: Ritual | null;
  userProgress: RitualUserProgress | null;
}

export const useRitualsStore = createAsyncStore<RitualsData>({
  name: 'rituals',
  fetcher: async () => {
    const response = await defaultClient.get<RitualsData>('/rituals/today', {
      cache: 'no-store',
    });
    return response.data;
  },
  cacheTtl: 2 * 60 * 1000, // 2 minutes (shorter TTL for daily ritual)
});

