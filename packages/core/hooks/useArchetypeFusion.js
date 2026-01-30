'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useFusionOptions() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/archetypes/fusion-options');
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed');
            setData({ base: json.base, options: json.options || [] });
        }
        catch (e) {
            setError(e?.message || 'Failed');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { data, loading, error, reload: load };
}
export function useArchetypeFusion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fuse = useCallback(async (baseA, baseB) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/archetypes/fuse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ baseA, baseB }) });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed');
            return null;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { fuse, loading, error };
}
