/**
 * Recipes Store
 * Zustand store for crafting recipes collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */

'use client';

import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

export interface Recipe {
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
    isCraftable: boolean;
  };
  ingredients: Array<{ itemId: string; quantity: number }>;
  craftTime: number;
  xpReward: number;
  discoveredBy: string | null;
  createdAt: string;
}

interface RecipesData {
  recipes: Recipe[];
  total: number;
}

export const useRecipesStore = createAsyncStore<RecipesData>({
  name: 'recipes',
  fetcher: async (itemId?: string, includeDiscovered: boolean = true) => {
    const params = new URLSearchParams();
    if (itemId) params.set('itemId', itemId);
    if (includeDiscovered) params.set('includeDiscovered', 'true');
    const queryString = params.toString();
    const path = queryString ? `/items/recipes?${queryString}` : '/items/recipes';
    const response = await defaultClient.get<RecipesData>(path);
    return response.data;
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

