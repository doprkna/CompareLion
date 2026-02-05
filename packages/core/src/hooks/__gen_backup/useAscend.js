'use client';
// sanity-fix
import { useCallback, useState } from 'react';
export function useAscend() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const ascend = useCallback(async (inheritedPerks) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/generation/ascend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inheritedPerks }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to ascend');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to ascend');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { ascend, loading, error };
}
