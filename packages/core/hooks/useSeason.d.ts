/**
 * useSeason Hook
 * v0.41.19 - Migrated to unified state store
 */
import type { Season, UserProgress } from '../state/stores/seasonStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export type { Season, UserProgress };
export declare function useSeason(): {
    season: any;
    userProgress: any;
    loading: any;
    error: any;
    reload: any;
};
