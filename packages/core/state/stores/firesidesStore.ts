/**
 * Firesides Store
 * Zustand store for firesides collection and individual fireside with reactions (nested DTOs)
 * v0.41.19 - C3 Step 20: State Migration Batch #3
 */

'use client';

import { createAsyncStore, createResourceStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface Fireside {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  [key: string]: any; // Allow additional fireside properties
}

export interface FiresideReaction {
  id: string;
  firesideId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

interface FiresidesData {
  firesides: Fireside[];
}

interface FiresideDetailData {
  fireside: Fireside | null;
  reactions: FiresideReaction[];
}

// Firesides list store
export const useFiresidesStore = createAsyncStore<FiresidesData>({
  name: 'firesides',
  fetcher: async () => {
    const response = await defaultClient.get<FiresidesData>('/firesides', {
      cache: 'no-store',
    });
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

// Individual fireside store (resource store by ID)
export const useFiresideStore = createResourceStore<FiresideDetailData>({
  name: 'fireside',
  fetcher: async (id: string) => {
    const response = await defaultClient.get<FiresideDetailData>(`/firesides/${id}`, {
      cache: 'no-store',
    });
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

