'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useSynchTests() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/synch-tests/available', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load tests');
            setTests(json.tests || []);
        }
        catch (e) {
            setError(e?.message || 'Failed to load tests');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { tests, loading, error, reload: load };
}
export function useStartSynchTest() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const start = useCallback(async (testId, targetUserId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/synch-tests/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId, targetUserId }),
            });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to start test');
            return json.test;
        }
        catch (e) {
            setError(e?.message || 'Failed to start test');
            throw e;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { start, loading, error };
}
export function useSynchResult(id) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!id)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/synch-tests/result/${id}`, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load result');
            setResult(json.result || json);
        }
        catch (e) {
            setError(e?.message || 'Failed to load result');
        }
        finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => { load(); }, [load]);
    return { result, loading, error, reload: load };
}