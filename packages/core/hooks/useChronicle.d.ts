/**
 * useChronicle Hook
 * v0.41.19 - Migrated to unified state store (read-only part)
 */
import type { Chronicle } from '../state/stores/chronicleStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export type { Chronicle };
export declare function useChronicle(type?: 'weekly' | 'seasonal'): {
    chronicle: any;
    loading: any;
    error: any;
    reload: () => any;
};
export declare function useGenerateChronicle(): {
    generateChronicle: (type: "weekly" | "seasonal", seasonId?: string) => Promise<any>;
    loading: any;
    error: any;
};
