import { useCallback, useEffect, useState } from 'react';

export function useLatestCard() {
  const [card, setCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/comparison-cards/latest', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load');
      setCard(json.card || null);
    } catch (e: any) { setError(e?.message || 'Failed to load'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { card, loading, error, reload: load };
}

export function useGenerateCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/comparison-cards/generate', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to generate');
      return json.card as any;
    } catch (e: any) { setError(e?.message || 'Failed to generate'); return null; } finally { setLoading(false); }
  }, []);
  return { generate, loading, error };
}


