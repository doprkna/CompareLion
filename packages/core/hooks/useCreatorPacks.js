'use client';
// sanity-fix
'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './apiClient'; // sanity-fix
export function useCreatorPacks(type) {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const loadPacks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (type)
                params.set('type', type);
            const data = await apiFetch(`/api/creator/packs?${params.toString()}`);
            if (data) {
                setPacks(data.packs);
                setTotal(data.total);
            }
            else {
                setError('Failed to load creator packs');
            }
        }
        catch (e) {
            setError(e?.message || 'Failed to load creator packs');
        }
        finally {
            setLoading(false);
        }
    }, [type]);
    useEffect(() => {
        loadPacks();
    }, [loadPacks]);
    const submitPack = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/creator/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                throw new Error(json?.error || 'Failed to submit pack');
            }
            await loadPacks(); // Reload packs after submission
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to submit pack');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, [loadPacks]);
    return { packs, loading, error, total, reload: loadPacks, submitPack };
}