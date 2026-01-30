'use client';
import { useCallback, useState } from 'react';
export function useCrafting() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const craft = useCallback(async (recipeId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/items/craft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                throw new Error(json?.error || 'Failed to craft item');
            }
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to craft item');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { craft, loading, error };
}
