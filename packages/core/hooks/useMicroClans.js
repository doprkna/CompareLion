'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';
export function useMicroClans(seasonId) {
    const [clans, setClans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = seasonId
                ? `/api/micro-clans?seasonId=${seasonId}`
                : '/api/micro-clans';
            const res = await fetch(url, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load clans');
            setClans(json?.clans || []); // sanity-fix
        }
        catch (e) {
            setError(e?.message || 'Failed to load clans');
        }
        finally {
            setLoading(false);
        }
    }, [seasonId]);
    useEffect(() => { load(); }, [load]);
    return { clans, loading, error, reload: load };
}
export function useClan(clanId) {
    const [clan, setClan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        if (!clanId) {
            setClan(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/micro-clans/${clanId}`, { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load clan');
            setClan(json?.clan ?? null); // sanity-fix
        }
        catch (e) {
            setError(e?.message || 'Failed to load clan');
        }
        finally {
            setLoading(false);
        }
    }, [clanId]);
    useEffect(() => { load(); }, [load]);
    return { clan, loading, error, reload: load };
}
export function useClanBuff() {
    const [buff, setBuff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Find user's clan
            const res = await fetch('/api/micro-clans', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok || !json?.success)
                throw new Error(json?.error || 'Failed to load clans');
            // Check if user is in any clan (simplified: check all clans)
            // In a full implementation, there would be a /api/micro-clans/my-clan endpoint
            const userClans = json?.clans || []; // sanity-fix
            const activeClan = Array.isArray(userClans) ? userClans.find((c) => c.buffActive) : null; // sanity-fix
            if (activeClan) {
                setBuff({
                    type: activeClan.buffType,
                    value: activeClan.buffValue,
                    clanName: activeClan.name,
                });
            }
            else {
                setBuff(null);
            }
        }
        catch (e) {
            setError(e?.message || 'Failed to load clan buff');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    return { buff, loading, error, reload: load };
}