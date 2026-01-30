'use client';
// sanity-fix
import { useCallback, useState } from 'react';
export function useRedeemWildcard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const redeem = useCallback(async (userWildcardId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/wildcards/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userWildcardId }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to redeem wildcard');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to redeem wildcard');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { redeem, loading, error };
}
