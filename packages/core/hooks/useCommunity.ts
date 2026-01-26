'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';

export function useCommunityCreations(type?: string | null) {
  const [creations, setCreations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/community/approved', window.location.origin);
      if (type) url.searchParams.set('type', type);
      const res = await fetch(url.toString(), { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load creations');
      setCreations(json.creations || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load creations');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return { creations, loading, error, reload: load };
}

export function useSubmitCreation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: {
    title: string;
    type: 'question' | 'mission' | 'item' | 'other';
    content: any;
    rewardXP?: number;
    rewardKarma?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/community/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to submit creation');
      return json.creation;
    } catch (e: any) {
      setError(e?.message || 'Failed to submit creation');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}

export function useLikeCreation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const like = useCallback(async (creationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/community/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creationId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to like creation');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to like creation');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { like, loading, error };
}
