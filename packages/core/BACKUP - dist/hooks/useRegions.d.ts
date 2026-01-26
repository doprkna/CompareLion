import type { Region } from '../state/stores/regionsStore';
export type { Region };
/**
 * useRegions Hook
 * v0.41.18 - Migrated to unified state store
 */
export declare function useRegions(): {
    regions: any;
    loading: any;
    error: any;
    activeRegionId: any;
    reload: any;
};
export declare function useTravel(): {
    travel: (targetRegionId: string) => Promise<any>;
    loading: any;
    error: any;
};
export declare function useActiveRegion(): {
    region: any;
    loading: any;
    error: any;
    reload: () => Promise<void>;
};
export declare function useUnlockRegion(): {
    unlock: (regionId: string) => Promise<any>;
    loading: any;
    error: any;
};
