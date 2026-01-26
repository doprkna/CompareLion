'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useRoastLevel() {
    const [roastLevel, setRoastLevel] = useState(3);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/user/settings/roast', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load roast level');
            setRoastLevel(json.roastLevel || 3);
        }
        catch (e) {
            setError(e?.message || 'Failed to load roast level');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { roastLevel, loading, error, reload: load };
}
export function useSetRoastLevel() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const setLevel = useCallback(async (level) => {
        if (level < 1 || level > 5) {
            throw new Error('Roast level must be between 1 and 5');
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/user/settings/roast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to set roast level');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to set roast level');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { setLevel, loading, error };
}
