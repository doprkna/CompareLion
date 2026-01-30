'use client';
// sanity-fix
import { useCallback, useState } from 'react';
export function useCheckWildcard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const check = useCallback(async (triggerType) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/wildcards/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggerType }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to check wildcard');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to check wildcard');
            return { triggered: false };
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { check, loading, error };
}
