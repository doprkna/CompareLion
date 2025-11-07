import { useCallback, useEffect, useState } from 'react';

export function useWildcards() {
  const [wildcards, setWildcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/wildcards/recent', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load wildcards');
      setWildcards(json.wildcards || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load wildcards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { wildcards, loading, error, reload: load };
}

