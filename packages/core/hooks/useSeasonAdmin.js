'use client';
// sanity-fix
'use client';
import { useCallback, useState } from 'react';
export function useSeasonAdmin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const performAction = useCallback(async (actionData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/season', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actionData),
            });
            const json = await res.json();
            if (!res.ok || !json?.success) {
                throw new Error(json?.error || 'Failed to perform season action');
            }
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to perform season action');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const startSeason = useCallback(async (data) => {
        return performAction({ action: 'start', ...data });
    }, [performAction]);
    const endSeason = useCallback(async (seasonId, endDate) => {
        return performAction({ action: 'end', seasonId, endDate });
    }, [performAction]);
    const updateSeason = useCallback(async (seasonId, data) => {
        return performAction({ action: 'update', seasonId, ...data });
    }, [performAction]);
    return {
        performAction,
        startSeason,
        endSeason,
        updateSeason,
        loading,
        error,
    };
}
