/**
 * Season Store
 * Zustand store for season data with user progress (multi-source aggregation)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */

'use client';

import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface Season {
  id: string;
  name: string;
  displayName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  [key: string]: any; // Allow additional season properties
}

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  completedChallenges: number;
  totalChallenges: number;
  [key: string]: any; // Allow additional progress properties
}

interface SeasonData {
  season: Season | null;
  userProgress: UserProgress | null;
}

export const useSeasonStore = createAsyncStore<SeasonData>({
  name: 'season',
  fetcher: async () => {
    const response = await defaultClient.get<SeasonData>('/meta/season', {
      cache: 'no-store',
    });
    return response.data;
  },
  cacheTtl: 2 * 60 * 1000, // 2 minutes (shorter TTL for dynamic data)
});

