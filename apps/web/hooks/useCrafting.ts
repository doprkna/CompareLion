'use client';

import { useCallback, useState } from 'react';

interface CraftResult {
  success: boolean;
  message: string;
  item: {
    id: string;
    itemId: string;
    quantity: number;
  };
  isNewDiscovery: boolean;
  xpReward: number;
  newXP: number;
  newLevel: number;
}

export function useCrafting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const craft = useCallback(async (recipeId: string): Promise<CraftResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/items/craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to craft item');
      }
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to craft item');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { craft, loading, error };
}

