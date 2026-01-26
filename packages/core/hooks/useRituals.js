'use client';
// sanity-fix
/**
 * useRituals Hook
 * v0.41.19 - Migrated to unified state store (read-only part)
 */
import { useEffect, useState, useCallback } from 'react'; // sanity-fix
import { useRitualsStore } from '@parel/core/state/stores/ritualsStore';
export function useRituals() {
    const { state, load, reload } = useRitualsStore();
    useEffect(() => {
        load();
    }, [load]);
    return {
        ritual: state.data?.ritual || null,
        userProgress: state.data?.userProgress || null,
        loading: state.loading,
        error: state.error,
        reload,
    };
}
export function useCompleteRitual() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const complete = useCallback(async (ritualId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/rituals/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ritualId }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to complete ritual');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to complete ritual');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { complete, loading, error };
}