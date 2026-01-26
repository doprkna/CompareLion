'use client';
// sanity-fix
import { useEffect, useState, useCallback } from 'react';
export function useGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/groups', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load groups');
            setGroups(json.groups || []);
        }
        catch (e) {
            setError(e?.message || 'Failed to load groups');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { groups, loading, error, reload: load };
}
export function useGroup(groupId) {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!groupId)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/groups/${groupId}`, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load group');
            setGroup(json.group || null);
        }
        catch (e) {
            setError(e?.message || 'Failed to load group');
        }
        finally {
            setLoading(false);
        }
    }, [groupId]);
    useEffect(() => { load(); }, [load]);
    return { group, loading, error, reload: load };
}
export function useGroupStats(groupId) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!groupId)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/groups/${groupId}/stats`, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load stats');
            setStats(json.stats || null);
        }
        catch (e) {
            setError(e?.message || 'Failed to load stats');
        }
        finally {
            setLoading(false);
        }
    }, [groupId]);
    useEffect(() => { load(); }, [load]);
    return { stats, loading, error, reload: load };
}
export function useGroupReflections(groupId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!groupId)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/groups/${groupId}/reflections`, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load reflections');
            setData(json.reflections || null);
        }
        catch (e) {
            setError(e?.message || 'Failed to load reflections');
        }
        finally {
            setLoading(false);
        }
    }, [groupId]);
    useEffect(() => { load(); }, [load]);
    return { data, loading, error, reload: load };
}