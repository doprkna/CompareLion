/**
 * useDiscoveryIndex Hook
 * Fetches item discoveries
 * v0.41.14 - Migrated to unified API client
 * v0.41.18 - Migrated to unified state store
 */
import type { Discovery } from '../state/stores/discoveriesStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export type { Discovery };
export declare function useDiscoveryIndex(): {
    discoveries: any;
    loading: any;
    error: any;
    total: any;
    reload: any;
};
