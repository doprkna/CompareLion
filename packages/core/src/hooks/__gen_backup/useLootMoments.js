'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useLootMoments(limit = 5) {
    const [loot, setLoot] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/loot/recent?limit=${limit}`, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load loot');
            setLoot(json.loot || []);
        }
        catch (e) {
            setError(e?.message || 'Failed to load loot');
        }
        finally {
            setLoading(false);
        }
    }, [limit]);
    useEffect(() => { load(); }, [load]);
    return { loot, loading, error, reload: load };
}
export function useLootCheck() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const check = useCallback(async (trigger) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/loot/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trigger }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to check loot');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to check loot');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { check, loading, error };
}
export function useLootRedeem() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const redeem = useCallback(async (lootId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/loot/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lootId }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to redeem loot');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to redeem loot');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { redeem, loading, error };
}
