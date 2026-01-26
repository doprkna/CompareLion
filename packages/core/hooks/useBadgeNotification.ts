'use client';

import { useEffect, useState } from 'react';
import { useRealtime } from './useRealtime';

export interface BadgeUnlockEvent {
  userId: string;
  userName: string;
  badgeId: string;
  badgeKey: string;
  name: string;
  icon: string;
  rarity: string;
  rewardType?: string | null;
  rewardValue?: string | null;
}

export function useBadgeNotification(
  onUnlock?: (badge: BadgeUnlockEvent) => void
) {
  const { subscribe, unsubscribe } = useRealtime();
  const [pendingUnlock, setPendingUnlock] = useState<BadgeUnlockEvent | null>(null);

  useEffect(() => {
    const handleBadgeUnlock = (event: BadgeUnlockEvent) => {
      setPendingUnlock(event);
      if (onUnlock) {
        onUnlock(event);
      }
    };

    subscribe('badge:unlock', handleBadgeUnlock);

    return () => {
      unsubscribe('badge:unlock', handleBadgeUnlock);
    };
  }, [subscribe, unsubscribe, onUnlock]);

  const clearPending = () => {
    setPendingUnlock(null);
  };

  return { pendingUnlock, clearPending };
}

