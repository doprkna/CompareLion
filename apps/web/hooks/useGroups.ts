import { useEffect, useState, useCallback } from 'react';

export interface GroupListItem {
  id: string;
  name: string;
  description?: string | null;
  visibility: 'private' | 'public';
  transparency: 'summary' | 'full' | 'hidden';
  role: string;
  createdAt: string;
}

export function useGroups() {
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/groups', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load groups');
      setGroups(json.groups || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { groups, loading, error, reload: load };
}

export interface GroupDetails {
  id: string;
  name: string;
  description?: string | null;
  visibility: 'private' | 'public';
  transparency: 'summary' | 'full' | 'hidden';
  memberCount: number;
  owner: { id: string; name: string | null; username: string | null } | null;
  createdAt: string;
}

export function useGroup(groupId: string | null) {
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${groupId}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load group');
      setGroup(json.group || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  return { group, loading, error, reload: load };
}

export interface GroupStats {
  totalXP: number;
  reflections: number;
  avgLevel: number;
  memberCount: number;
  transparency: 'summary' | 'full' | 'hidden';
  visibility: 'private' | 'public';
  isMember: boolean;
}

export function useGroupStats(groupId: string | null) {
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/stats`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load stats');
      setStats(json.stats || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, error, reload: load };
}

export interface GroupReflectionItem {
  id?: string;
  userId?: string;
  content?: string | null;
  summary?: string | null;
  sentiment?: string | null;
  createdAt?: string;
  user?: { id: string; name: string | null; username: string | null };
  count?: number; // summary mode
}

export function useGroupReflections(groupId: string | null) {
  const [data, setData] = useState<GroupReflectionItem[] | { count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/reflections`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load reflections');
      setData(json.reflections || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load reflections');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}


