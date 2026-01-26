'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function usePacks() {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/packs', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load packs');
            setPacks(json.packs || []);
        }
        catch (e) {
            setError(e?.message || 'Failed to load packs');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { packs, loading, error, reload: load };
}
export function usePack(id) {
    const [pack, setPack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!id)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/packs/${id}`, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load pack');
            setPack(json.pack || null);
        }
        catch (e) {
            setError(e?.message || 'Failed to load pack');
        }
        finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => { load(); }, [load]);
    return { pack, loading, error, reload: load };
}
export function useUnlockPack() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const unlock = useCallback(async (packId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/packs/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packId }) });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to unlock pack');
            return true;
        }
        catch (e) {
            setError(e?.message || 'Failed to unlock pack');
            return false;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { unlock, loading, error };
}