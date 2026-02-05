import type { Region as RegionEntity } from '../state/stores/regionsStore';
export type { RegionEntity };
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
    loading: boolean;
    error: string | null;
};
export declare function useActiveRegion(): {
    region: RegionEntity | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
};
export declare function useUnlockRegion(): {
    unlock: (regionId: string) => Promise<any>;
    loading: boolean;
    error: string | null;
};
