'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from './apiClient'; // sanity-fix

export interface CreatorPack {
  id: string;
  creatorId: string;
  creator?: {
    id: string;
    username: string | null;
    name: string | null;
    avatarUrl?: string | null;
  } | null;
  title: string;
  description?: string | null;
  type: 'POLL' | 'REFLECTION' | 'MISSION';
  status: 'DRAFT' | 'APPROVED' | 'REJECTED';
  metadata?: any;
  createdAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
}

interface CreatorPacksData {
  packs: CreatorPack[];
  total: number;
  limit: number;
  offset: number;
}

interface SubmitPackData {
  title: string;
  description?: string;
  type: 'POLL' | 'REFLECTION' | 'MISSION';
  metadata?: any;
}

interface SubmitPackResult {
  success: boolean;
  pack: {
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
  };
  message: string;
}

export function useCreatorPacks(type?: 'POLL' | 'REFLECTION' | 'MISSION') {
  const [packs, setPacks] = useState<CreatorPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const loadPacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      const data = await apiFetch<CreatorPacksData>(`/api/creator/packs?${params.toString()}`);
      if (data) {
        setPacks(data.packs);
        setTotal(data.total);
      } else {
        setError('Failed to load creator packs');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load creator packs');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const submitPack = useCallback(async (data: SubmitPackData): Promise<SubmitPackResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/creator/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to submit pack');
      }
      await loadPacks(); // Reload packs after submission
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to submit pack');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [loadPacks]);

  return { packs, loading, error, total, reload: loadPacks, submitPack };
}

