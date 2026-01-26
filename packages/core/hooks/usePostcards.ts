'use client';
// sanity-fix
import { useCallback, useEffect, useState } from 'react';

export function usePostcards(type: 'inbox' | 'sent' = 'inbox') {
  const [postcards, setPostcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = type === 'inbox' ? '/api/postcards/inbox' : '/api/postcards/sent';
      const res = await fetch(endpoint, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load postcards');
      setPostcards(json.postcards || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load postcards');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return { postcards, loading, error, reload: load };
}

export function useSendPostcard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (receiverId: string, message: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/postcards/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, message }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to send postcard');
      return json.postcard;
    } catch (e: any) {
      setError(e?.message || 'Failed to send postcard');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { send, loading, error };
}

export function useReadPostcard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const read = useCallback(async (postcardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/postcards/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcardId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to mark as read');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to mark as read');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { read, loading, error };
}
