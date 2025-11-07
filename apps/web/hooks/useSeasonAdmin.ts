'use client';

import { useCallback, useState } from 'react';

interface SeasonAction {
  action: 'start' | 'end' | 'update';
  seasonId?: string;
  key?: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  xpBonus?: number;
  goldBonus?: number;
}

interface SeasonActionResult {
  success: boolean;
  message: string;
  season?: {
    id: string;
    key: string;
    title: string;
    startDate: string;
    endDate?: string | null;
  };
}

export function useSeasonAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = useCallback(async (actionData: SeasonAction): Promise<SeasonActionResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to perform season action');
      }
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to perform season action');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const startSeason = useCallback(async (data: {
    key?: string;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return performAction({ action: 'start', ...data });
  }, [performAction]);

  const endSeason = useCallback(async (seasonId: string, endDate?: string) => {
    return performAction({ action: 'end', seasonId, endDate });
  }, [performAction]);

  const updateSeason = useCallback(async (seasonId: string, data: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return performAction({ action: 'update', seasonId, ...data });
  }, [performAction]);

  return {
    performAction,
    startSeason,
    endSeason,
    updateSeason,
    loading,
    error,
  };
}

