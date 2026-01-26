/**
 * useRituals Hook
 * v0.41.19 - Migrated to unified state store (read-only part)
 */
import type { Ritual, RitualUserProgress } from '../state/stores/ritualsStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export type { Ritual, RitualUserProgress };
export declare function useRituals(): {
    ritual: any;
    userProgress: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useCompleteRitual(): {
    complete: any;
    loading: any;
    error: any;
};
