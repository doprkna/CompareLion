'use client';
// sanity-fix
/**
 * useBadges Hook
 * v0.41.19 - Migrated to unified state store
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useBadgesStore, useUserBadgesStore } from '../state/stores/badgesStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
import type { Badge } from '../state/stores/badgesStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import

export type { Badge };

export function useBadges() {
  const { state, load, reload } = useBadgesStore();

  useEffect(() => {
    load();
  }, [load]);

  return {
    badges: state.data?.badges || [],
    loading: state.loading,
    error: state.error,
    reload: (unlocked?: boolean) => reload(unlocked),
  };
}

export function useUserBadges() {
  const { state, load, reload } = useUserBadgesStore();

  useEffect(() => {
    load();
  }, [load]);

  // Computed selectors
  const badges = state.data?.badges || [];
  const claimedCount = useMemo(() => badges.filter(b => b.isClaimed).length, [badges]);
  const unclaimedCount = useMemo(() => badges.filter(b => !b.isClaimed && b.canClaim).length, [badges]);

  return {
    badges,
    loading: state.loading,
    error: state.error,
    reload,
    claimedCount,
    unclaimedCount,
  };
}
