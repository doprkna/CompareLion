/**
 * useRecipes Hook
 * Fetches item recipes
 * v0.41.14 - Migrated to unified API client
 * v0.41.18 - Migrated to unified state store
 */
'use client';
import { useEffect } from 'react';
import { useRecipesStore } from '@parel/core/state/stores/recipesStore';
export function useRecipes(itemId, includeDiscovered = true) {
    const { state, load, reload } = useRecipesStore();
    useEffect(() => {
        load(itemId, includeDiscovered);
    }, [load, itemId, includeDiscovered]);
    return {
        recipes: state.data?.recipes || [],
        loading: state.loading,
        error: state.error,
        total: state.data?.total || 0,
        reload: () => reload(itemId, includeDiscovered),
    };
}
