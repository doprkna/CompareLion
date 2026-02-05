'use client';
// sanity-fix
/**
 * useLegacy Hook
 * Fetches legacy metadata
 * v0.41.12 - Migrated to unified API client
 */
import { useCallback, useEffect, useState } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)
export function useLegacy() {
    const [legacy, setLegacy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await defaultClient.get('/meta/legacy', {
                cache: 'no-store',
            });
            setLegacy(response?.data ?? null); // sanity-fix
        }
        catch (e) {
            const errorMessage = e instanceof ApiClientError
                ? e.message
                : e instanceof Error
                    ? e.message
                    : 'Failed to load legacy';
            setError(errorMessage);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    return { legacy, loading, error, reload: load };
}
