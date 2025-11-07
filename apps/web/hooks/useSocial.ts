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

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/social/friends');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch friends');
      }
      setFriends(data.friends || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return { friends, loading, error, reload: fetchFriends };
}

export function useDuels() {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDuels = async () => {
    setLoading(true);
    setError(null);
    try {
      // This would need a GET endpoint - for now using placeholder
      const res = await fetch('/api/social/duels');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch duels');
      }
      setDuels(data.duels || []);
    } catch (err) {
      // Endpoint might not exist yet, set empty array
      setDuels([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuels();
  }, []);

  return { duels, loading, error, reload: fetchDuels };
}

export function useSocialFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/social/feed');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch feed');
      }
      setFeed(data.feed || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
      setFeed([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return { feed, loading, error, reload: fetchFeed };
}

export function useFriendRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async (userId: string, action: 'send' | 'accept' | 'decline' | 'block') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/social/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to process friend request');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process request';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest, loading, error };
}

export function useStartDuel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDuel = async (opponentId: string, type: 'xp' | 'reflection' | 'random' | 'poll') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/social/duels/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opponentId, type }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to start duel');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start duel';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { startDuel, loading, error };
}




