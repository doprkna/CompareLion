import type { LoreEntry, LorePagination } from '../state/stores/loreStore';
export type { LoreEntry, LorePagination };
/**
 * useLoreEntries Hook
 * v0.41.18 - Migrated to unified state store
 */
export declare function useLoreEntries(page?: number, limit?: number): {
    entries: any;
    loading: any;
    error: any;
    pagination: any;
    reload: () => any;
};
/**
 * useLatestLore Hook
 * v0.41.19 - Migrated to unified state store
 */
export declare function useLatestLore(): {
    entries: any;
    loading: any;
    error: any;
    reload: any;
};
export declare function useGenerateLore(): {
    generate: (sourceType: "reflection" | "quest" | "item" | "event" | "system", sourceId?: string) => Promise<LoreEntry>;
    loading: any;
    error: any;
};
export declare function useLoreTone(): {
    tone: any;
    updateTone: (newTone: "serious" | "comedic" | "poetic") => Promise<any>;
    loading: any;
    error: any;
};
