'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';

export function useAffinities() {
  const [affinities, setAffinities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/affinities', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load affinities');
      setAffinities(json.affinities || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load affinities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { affinities, loading, error, reload: load };
}

export function useAffinityActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async (url: string, body: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Request failed');
      return true;
    } catch (e: any) {
      setError(e?.message || 'Request failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    request: (targetId: string, type: 'friend'|'rival'|'mentor'|'romance') => post('/api/affinities/request', { targetId, type }),
    accept: (sourceId: string, type: 'friend'|'rival'|'mentor'|'romance') => post('/api/affinities/accept', { sourceId, type }),
    remove: (targetId: string, type: 'friend'|'rival'|'mentor'|'romance') => post('/api/affinities/remove', { targetId, type }),
  };
}


