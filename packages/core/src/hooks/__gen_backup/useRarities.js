'use client';
// sanity-fix
/**
 * useRarities Hook
 * v0.41.18 - Migrated to unified state store
 */
import { useEffect, useState, useCallback } from 'react';
import { useRaritiesStore } from '../state/stores/raritiesStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
export function useRarities() {
    const { state, load, reload } = useRaritiesStore();
    useEffect(() => {
        load();
    }, [load]);
    return {
        rarities: state.data?.rarities || [],
        loading: state.loading,
        error: state.error,
        reload,
    };
}
export function useSeedRarities() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const seed = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/rarities/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to seed rarities');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to seed rarities');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { seed, loading, error };
}
