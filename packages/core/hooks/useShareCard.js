'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useShareCard(shareCardId) {
    const [shareCard, setShareCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!shareCardId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/share/${shareCardId}`, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load share card');
            setShareCard(json.shareCard);
        }
        catch (e) {
            setError(e?.message || 'Failed to load share card');
        }
        finally {
            setLoading(false);
        }
    }, [shareCardId]);
    useEffect(() => {
        load();
    }, [load]);
    return { shareCard, loading, error, reload: load };
}