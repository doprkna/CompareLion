'use client';
// sanity-fix
'use client';

import { useState, useEffect } from 'react';
import { useLoreStore } from '../state/stores/loreStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
import { useLatestLoreStore } from '../state/stores/latestLoreStore';
import type { LoreEntry, LorePagination } from '../state/stores/loreStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import

export type { LoreEntry, LorePagination };

/**
 * useLoreEntries Hook
 * v0.41.18 - Migrated to unified state store
 */
export function useLoreEntries(page: number = 1, limit: number = 20) {
  const { state, load, reload } = useLoreStore();

  useEffect(() => {
    load(page, limit);
  }, [load, page, limit]);

  return {
    entries: state.data?.entries || [],
    loading: state.loading,
    error: state.error,
    pagination: state.data?.pagination || null,
    reload: () => reload(page, limit),
  };
}

/**
 * useLatestLore Hook
 * v0.41.19 - Migrated to unified state store
 */
export function useLatestLore() {
  const { state, load, reload } = useLatestLoreStore();

  useEffect(() => {
    load();
  }, [load]);

  return {
    entries: state.data?.entries || [],
    loading: state.loading,
    error: state.error,
    reload,
  };
}

export function useGenerateLore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (sourceType: 'reflection' | 'quest' | 'item' | 'event' | 'system', sourceId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lore/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceType, sourceId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate lore');
      }
      return data.entry as LoreEntry;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate lore';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}

export function useLoreTone() {
  const [tone, setTone] = useState<'serious' | 'comedic' | 'poetic' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTone = async (newTone: 'serious' | 'comedic' | 'poetic') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lore/tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone: newTone }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update tone');
      }
      setTone(newTone);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tone';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { tone, updateTone, loading, error };
}
