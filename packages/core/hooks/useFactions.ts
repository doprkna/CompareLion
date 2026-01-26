'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';

export function useFactions(region?: string | null) {
  const [factions, setFactions] = useState<any[]>([]);
  const [userFaction, setUserFaction] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window === 'undefined') { // sanity-fix
        setError('Client-side only');
        setLoading(false);
        return;
      }
      const url = new URL('/api/factions', window.location.origin);
      if (region) url.searchParams.set('region', region);
      const res = await fetch(url.toString(), { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load factions');
      setFactions(json.factions || []);
      setUserFaction(json.userFaction || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load factions');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => { load(); }, [load]);

  return { factions, userFaction, loading, error, reload: load };
}

export function useJoinFaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = useCallback(async (factionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/factions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factionId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to join faction');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to join faction');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { join, loading, error };
}

export function useFactionMap(region?: string | null) {
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof window === 'undefined') { // sanity-fix
        setError('Client-side only');
        setLoading(false);
        return;
      }
      const url = new URL('/api/factions/map', window.location.origin);
      if (region) url.searchParams.set('region', region);
      const res = await fetch(url.toString(), { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load map');
      setMap(json.map || {});
    } catch (e: any) {
      setError(e?.message || 'Failed to load map');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => { load(); }, [load]);

  return { map, loading, error, reload: load };
}

export function useFactionContribution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contribute = useCallback(async (amount: number, region?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/factions/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, region }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to contribute');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to contribute');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { contribute, loading, error };
}
