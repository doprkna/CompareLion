/**
 * useRecipes Hook
 * Fetches item recipes
 * v0.41.14 - Migrated to unified API client
 * v0.41.18 - Migrated to unified state store
 */
import type { Recipe } from '../state/stores/recipesStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export type { Recipe };
export declare function useRecipes(itemId?: string, includeDiscovered?: boolean): {
    recipes: any;
    loading: any;
    error: any;
    total: any;
    reload: () => any;
};
