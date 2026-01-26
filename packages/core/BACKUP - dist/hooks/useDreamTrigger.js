'use client';
// sanity-fix
import { useCallback, useState } from 'react';
export function useDreamTrigger() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const trigger = useCallback(async (triggerType) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/dreamspace/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ triggerType }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to trigger dream');
            return json;
        }
        catch (e) {
            setError(e?.message || 'Failed to trigger dream');
            return { triggered: false };
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { trigger, loading, error };
}
