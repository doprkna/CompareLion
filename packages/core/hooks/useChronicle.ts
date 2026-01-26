'use client';
// sanity-fix
/**
 * useChronicle Hook
 * v0.41.19 - Migrated to unified state store (read-only part)
 */

'use client';

import { useEffect } from 'react';
import { useChronicleStore } from '../state/stores/chronicleStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
import type { Chronicle } from '../state/stores/chronicleStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import

export type { Chronicle };

export function useChronicle(type: 'weekly' | 'seasonal' = 'weekly') {
  const { state, load, reload } = useChronicleStore();

  useEffect(() => {
    load(type);
  }, [load, type]);

  return {
    chronicle: state.data?.chronicle || null,
    loading: state.loading,
    error: state.error,
    reload: () => reload(type),
  };
}

export function useGenerateChronicle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChronicle = async (type: 'weekly' | 'seasonal', seasonId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chronicles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, seasonId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate chronicle');
      }
      return data.chronicle;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate chronicle';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateChronicle, loading, error };
}
