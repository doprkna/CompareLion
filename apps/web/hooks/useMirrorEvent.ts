import { useCallback, useEffect, useState } from 'react';

export function useMirrorEvent() {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mirror-events/active', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load mirror event');
      setEvent(json.event);
    } catch (e: any) {
      setError(e?.message || 'Failed to load mirror event');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { event, loading, error, reload: load };
}

