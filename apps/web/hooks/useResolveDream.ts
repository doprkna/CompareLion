import { useCallback, useState } from 'react';

export function useResolveDream() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = useCallback(async (userDreamId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dreamspace/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDreamId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to resolve dream');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to resolve dream');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resolve, loading, error };
}

