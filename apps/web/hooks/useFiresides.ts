import { useCallback, useEffect, useRef, useState } from 'react';

export function useFiresides() {
  const [firesides, setFiresides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/firesides', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load firesides');
      setFiresides(json.firesides || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load firesides');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { firesides, loading, error, reload: load };
}

export function useFireside(id: string | null) {
  const [fireside, setFireside] = useState<any | null>(null);
  const [reactions, setReactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/firesides/${id}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load');
      setFireside(json.fireside);
      setReactions(json.reactions || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  return { fireside, reactions, loading, error, reload: load };
}

export function useFiresideReactions(id: string | null) {
  const { fireside, reactions, reload } = useFireside(id);
  const [posting, setPosting] = useState(false);
  const post = useCallback(async (emoji: string) => {
    if (!id) return false;
    setPosting(true);
    try {
      const res = await fetch('/api/firesides/react', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firesideId: id, emoji }) });
      const json = await res.json();
      if (!res.ok || !json?.success) return false;
      await reload();
      return true;
    } finally {
      setPosting(false);
    }
  }, [id, reload]);
  return { fireside, reactions, post, posting, reload };
}


