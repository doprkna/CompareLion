/**
 * Chronicle Store
 * Zustand store for chronicle data with nested stats and season (nested DTOs)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */

'use client';

import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface ChronicleStats {
  reflectionCount: number;
  xpGained: number;
  dominantSentiment: string;
  sentimentCounts: Record<string, number>;
  mostActiveDay?: string;
  periodStart: string;
  periodEnd: string;
}

export interface ChronicleSeason {
  id: string;
  name: string;
  displayName: string;
}

export interface Chronicle {
  id: string;
  type: 'weekly' | 'seasonal';
  summaryText: string;
  stats: ChronicleStats;
  quote?: string | null;
  generatedAt: string;
  season?: ChronicleSeason | null;
}

interface ChronicleData {
  chronicle: Chronicle | null;
}

export const useChronicleStore = createAsyncStore<ChronicleData>({
  name: 'chronicle',
  fetcher: async (type: 'weekly' | 'seasonal' = 'weekly') => {
    const response = await defaultClient.get<ChronicleData>(`/chronicles/latest?type=${type}`);
    return response.data;
  },
  cacheTtl: 10 * 60 * 1000, // 10 minutes (chronicles are relatively static)
});

