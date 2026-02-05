'use client';
// sanity-fix
/**
 * useDiscoveryIndex Hook
 * Fetches item discoveries
 * v0.41.14 - Migrated to unified API client
 * v0.41.18 - Migrated to unified state store
 */
'use client';
import { useEffect } from 'react';
import { useDiscoveriesStore } from '../state/stores/discoveriesStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export function useDiscoveryIndex() {
    const { state, load, reload } = useDiscoveriesStore();
    useEffect(() => {
        load();
    }, [load]);
    return {
        discoveries: state.data?.discoveries || [],
        loading: state.loading,
        error: state.error,
        total: state.data?.total || 0,
        reload,
    };
}
