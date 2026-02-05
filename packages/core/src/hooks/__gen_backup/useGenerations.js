'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useGenerations() {
    const [generations, setGenerations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/generation/history', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load generations');
            setGenerations(json);
        }
        catch (e) {
            setError(e?.message || 'Failed to load generations');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    return { generations, loading, error, reload: load };
}
