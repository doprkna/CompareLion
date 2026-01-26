'use client';
// sanity-fix
'use client';

import { useState, useEffect } from 'react';

export interface Friend {
  id: string;
  username: string | null;
  name: string | null;
  archetype: string | null;
  level: number;
  avatar: string | null;
  friendshipId: string;
  since: string;
}

export interface Duel {
  id: string;
  challengerId: string;
  opponentId: string;
  challenger?: {
    id: string;
    username: string | null;
    level: number;
  };
  opponent?: {
    id: string;
    username: string | null;
    level: number;
  };
  status: 'pending' | 'active' | 'completed' | 'expired';
  challengeType: 'xp' | 'reflection' | 'random' | 'poll';
  rewardXP: number;
  winnerId?: string | null;
  createdAt: string;
}

export interface FeedItem {
  type: 'badge' | 'duel' | 'quest';
  userId: string;
  username: string;
  data: any;
  timestamp: string;
}

export interface SharedMission {
  id: string;
  missionKey: string;
  participants: string[];
  status: 'active' | 'completed' | 'expired';
  rewardXP: number;
  createdAt: string;
  completedAt?: string | null;
}

/**
 * useSocial Hooks
 * v0.41.20 - Migrated to unified state store
 */

import { useEffect } from 'react';
import {
  useFriendsStore,
  useDuelsStore,
  useSocialFeedStore,
  useFriendRequestStore,
  useStartDuelStore,
} from '../state/stores/socialStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import
import type { Friend, Duel, FeedItem } from '../state/stores/socialStore'; // sanity-fix: replaced @parel/core/state/stores self-import with relative import

export type { Friend, Duel, FeedItem };

export function useFriends() {
  const { state, load, reload } = useFriendsStore();

  useEffect(() => {
    load();
  }, [load]);

  return { friends: state.data?.friends || [], loading: state.loading, error: state.error, reload };
}

export function useDuels() {
  const { state, load, reload } = useDuelsStore();

  useEffect(() => {
    load();
  }, [load]);

  return { duels: state.data?.duels || [], loading: state.loading, error: state.error, reload };
}

export function useSocialFeed() {
  const { state, load, reload } = useSocialFeedStore();

  useEffect(() => {
    load();
  }, [load]);

  return { feed: state.data?.feed || [], loading: state.loading, error: state.error, reload };
}

export function useFriendRequest() {
  const { sendRequest, loading, error } = useFriendRequestStore();
  return { sendRequest, loading, error };
}

export function useStartDuel() {
  const { startDuel, loading, error } = useStartDuelStore();
  return { startDuel, loading, error };
}



