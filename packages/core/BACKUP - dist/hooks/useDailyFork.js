'use client';
// sanity-fix
/**
 * useDailyFork Hooks
 * v0.41.20 - Migrated to unified state store
 */
import { useEffect } from 'react';
import { useDailyForkStore, useChooseForkStore } from '../state/stores/dailyForkStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export function useDailyFork() {
    const { state, load, reload } = useDailyForkStore();
    useEffect(() => {
        load();
    }, [load]);
    return {
        fork: state.data?.fork || null,
        userChoice: state.data?.userChoice || null,
        loading: state.loading,
        error: state.error,
        reload,
    };
}
export function useChooseFork() {
    const { choose, loading, error } = useChooseForkStore();
    return { choose, loading, error };
}
