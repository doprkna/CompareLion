'use client';

import { useState, useEffect } from 'react';

export interface LoreEntry {
  id: string;
  sourceType: 'reflection' | 'quest' | 'item' | 'event' | 'system';
  sourceId?: string | null;
  tone: 'serious' | 'comedic' | 'poetic';
  text: string;
  createdAt: string;
}

export interface LorePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useLoreEntries(page: number = 1, limit: number = 20) {
  const [entries, setEntries] = useState<LoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<LorePagination | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lore/all?page=${page}&limit=${limit}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch lore entries');
      }
      setEntries(data.entries || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lore entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [page, limit]);

  return { entries, loading, error, reload: fetchEntries, pagination };
}

export function useLatestLore() {
  const [entries, setEntries] = useState<LoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lore/latest');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch latest lore');
      }
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lore entries');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  return { entries, loading, error, reload: fetchLatest };
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

