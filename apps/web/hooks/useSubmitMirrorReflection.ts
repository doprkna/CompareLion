import { useCallback, useState } from 'react';

export function useSubmitMirrorReflection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (mirrorEventId: string, answers: Array<{ questionIndex: number; content: string }>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mirror-events/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mirrorEventId, answers }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to submit reflection');
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to submit reflection');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
}

