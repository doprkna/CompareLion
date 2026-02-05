import type { Recipe } from '../state/stores/recipesStore';
export type { Recipe };
export declare function useRecipes(itemId?: string, includeDiscovered?: boolean): {
    recipes: any;
    loading: any;
    error: any;
    total: any;
    reload: () => any;
};
