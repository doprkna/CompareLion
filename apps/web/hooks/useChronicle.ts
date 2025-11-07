'use client';

import { useState, useEffect } from 'react';

export interface Chronicle {
  id: string;
  type: 'weekly' | 'seasonal';
  summaryText: string;
  stats: {
    reflectionCount: number;
    xpGained: number;
    dominantSentiment: string;
    sentimentCounts: Record<string, number>;
    mostActiveDay?: string;
    periodStart: string;
    periodEnd: string;
  };
  quote?: string | null;
  generatedAt: string;
  season?: {
    id: string;
    name: string;
    displayName: string;
  } | null;
}

export function useChronicle(type: 'weekly' | 'seasonal' = 'weekly') {
  const [chronicle, setChronicle] = useState<Chronicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChronicle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chronicles/latest?type=${type}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch chronicle');
      }
      setChronicle(data.chronicle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chronicle');
      setChronicle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChronicle();
  }, [type]);

  return { chronicle, loading, error, reload: fetchChronicle };
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

