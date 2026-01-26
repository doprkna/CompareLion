'use client';
// sanity-fix
/**
 * useFeedback Hook
 * Submits user feedback
 * v0.41.13 - Migrated to unified API client
 */
'use client';
import { useCallback, useState } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix
export function useFeedback() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const submitFeedback = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await defaultClient.post('/feedback/submit', data);
            return response.data;
        }
        catch (e) {
            const errorMessage = e instanceof ApiClientError
                ? e.message
                : e instanceof Error
                    ? e.message
                    : 'Failed to submit feedback';
            setError(errorMessage);
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { submitFeedback, loading, error };
}
