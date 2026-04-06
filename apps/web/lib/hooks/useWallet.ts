'use client';

/**
 * useWallet Hook
 * Fetches canonical wallet (gold, diamonds) from GET /api/wallet.
 * v0.43.40 - Single source of truth for wallet display.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface UseWalletReturn {
  gold: number;
  diamonds: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CONTRACT_GUARD = process.env.NODE_ENV === 'development';

function assertWalletContract(data: unknown): void {
  if (!CONTRACT_GUARD) return;
  if (!data || typeof data !== 'object') return;
  const d = data as Record<string, unknown>;
  if (d.gold === undefined || d.diamonds === undefined) {
    console.error(
      '[useWallet] Contract violation: response missing gold or diamonds.',
      'Received keys:',
      Object.keys(d)
    );
  }
}

export function useWallet(): UseWalletReturn {
  const { data: session } = useSession();
  const [gold, setGold] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session?.user?.email) {
      setGold(0);
      setDiamonds(0);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/wallet');
      const json = await res.json();

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = json.data ?? json;
      assertWalletContract(data);

      const g = typeof data?.gold === 'number' ? data.gold : 0;
      const d = typeof data?.diamonds === 'number' ? data.diamonds : 0;
      setGold(g);
      setDiamonds(d);
    } catch (err) {
      console.error('[useWallet] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUpdate = () => refresh();
    if (typeof window !== 'undefined') {
      window.addEventListener('wallet:update', handleUpdate);
      window.addEventListener('inventory:refresh', handleUpdate);
      return () => {
        window.removeEventListener('wallet:update', handleUpdate);
        window.removeEventListener('inventory:refresh', handleUpdate);
      };
    }
  }, [refresh]);

  return { gold, diamonds, loading, refresh };
}
