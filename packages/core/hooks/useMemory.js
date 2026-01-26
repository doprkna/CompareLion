'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useLatestMemory() {
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/memory/latest', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load');
            setEntry(json?.entry || null); // sanity-fix
        }
        catch (e) {
            setError(e?.message || 'Failed to load');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { entry, loading, error, reload: load };
}
export function useMemoryArchive() {
    const [entries, setEntries] = useState([]);
    const [nextCursor, setNextCursor] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async (cursor) => {
        setLoading(true);
        setError(null);
        try {
            if (typeof window === 'undefined') { // sanity-fix
                setError('Client-side only');
                setLoading(false);
                return;
            }
            const url = new URL('/api/memory/all', window.location.origin);
            if (cursor)
                url.searchParams.set('cursor', cursor);
            const res = await fetch(url.toString(), { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load');
            setEntries((prev) => cursor ? [...prev, ...(json.entries || [])] : (json.entries || []));
            setNextCursor(json?.nextCursor); // sanity-fix
        }
        catch (e) {
            setError(e?.message || 'Failed to load');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { entries, nextCursor, loading, error, loadMore: () => nextCursor ? load(nextCursor) : undefined, reload: () => load() };
}
export function useGenerateMemory() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const generate = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/memory/generate', { method: 'POST' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to generate');
            return json?.entry ?? null; // sanity-fix
        }
        catch (e) {
            setError(e?.message || 'Failed to generate');
            return null;
        }
        finally {
            setLoading(false);
        }
    }, []);
    return { generate, loading, error };
}