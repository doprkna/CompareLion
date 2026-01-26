'use client';
// sanity-fix
'use client';
import { useState, useEffect } from 'react';
import { useLoreStore } from '@parel/core/state/stores/loreStore';
/**
 * useLoreEntries Hook
 * v0.41.18 - Migrated to unified state store
 */
export function useLoreEntries(page = 1, limit = 20) {
    const { state, load, reload } = useLoreStore();
    useEffect(() => {
        load(page, limit);
    }, [load, page, limit]);
    return {
        entries: state.data?.entries || [],
        loading: state.loading,
        error: state.error,
        pagination: state.data?.pagination || null,
        reload: () => reload(page, limit),
    };
}
/**
 * useLatestLore Hook
 * v0.41.19 - Migrated to unified state store
 */
export function useLatestLore() {
    const { state, load, reload } = useLatestLoreStore();
    useEffect(() => {
        load();
    }, [load]);
    return {
        entries: state.data?.entries || [],
        loading: state.loading,
        error: state.error,
        reload,
    };
}
export function useGenerateLore() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const generate = async (sourceType, sourceId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/lore/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceType, sourceId }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to generate lore');
            }
            return data.entry;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to generate lore';
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    return { generate, loading, error };
}
export function useLoreTone() {
    const [tone, setTone] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const updateTone = async (newTone) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/lore/tone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tone: newTone }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to update tone');
            }
            setTone(newTone);
            return data;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update tone';
            setError(message);
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    return { tone, updateTone, loading, error };
}