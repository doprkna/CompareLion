'use client';
// sanity-fix
/**
 * useSeason Hook
 * v0.41.19 - Migrated to unified state store
 */
import { useEffect } from 'react';
import { useSeasonStore } from '@parel/core/state/stores/seasonStore';
export function useSeason() {
    const { state, load, reload } = useSeasonStore();
    useEffect(() => {
        load();
    }, [load]);
    return {
        season: state.data?.season || null,
        userProgress: state.data?.userProgress || null,
        loading: state.loading,
        error: state.error,
        reload,
    };
}