'use client';

import { useState } from 'react';

export function useClaimBadge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimBadge = async (userBadgeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/badges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userBadgeId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to claim badge');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim badge';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { claimBadge, loading, error };
}

