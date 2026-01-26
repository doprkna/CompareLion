/**
 * Recipes Store
 * Zustand store for crafting recipes collection
 * v0.41.18 - C3 Step 19: State Migration Batch #2
 */
'use client';
import { createAsyncStore } from '../factory';
import { defaultClient } from '@parel/api'; // sanity-fix
export const useRecipesStore = createAsyncStore({
    name: 'recipes',
    fetcher: async (itemId, includeDiscovered = true) => {
        const params = new URLSearchParams();
        if (itemId)
            params.set('itemId', itemId);
        if (includeDiscovered)
            params.set('includeDiscovered', 'true');
        const queryString = params.toString();
        const path = queryString ? `/items/recipes?${queryString}` : '/items/recipes';
        const response = await defaultClient.get(path);
        return response.data;
    },
    cacheTtl: 5 * 60 * 1000, // 5 minutes
});
