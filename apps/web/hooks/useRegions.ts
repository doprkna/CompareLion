'use client';

import { useState, useEffect } from 'react';

export interface Region {
  id: string;
  key: string;
  name: string;
  description: string;
  orderIndex: number;
  buffType: 'xp' | 'gold' | 'mood' | 'reflection';
  buffValue: number;
  unlockRequirementType?: 'level' | 'task' | 'gold' | 'achievement' | null;
  unlockRequirementValue?: string | null;
  isActive?: boolean;
  isUnlocked?: boolean;
  canUnlock?: boolean;
}

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);

  const fetchRegions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/regions');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch regions');
      }
      setRegions(data.regions || []);
      setActiveRegionId(data.activeRegionId || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load regions');
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return { regions, loading, error, reload: fetchRegions, activeRegionId };
}

export function useTravel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const travel = async (targetRegionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/regions/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRegionId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to travel');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to travel';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { travel, loading, error };
}

export function useActiveRegion() {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveRegion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/regions/current');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch active region');
      }
      setRegion(data.region);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active region');
      setRegion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRegion();
  }, []);

  return { region, loading, error, reload: fetchActiveRegion };
}

export function useUnlockRegion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = async (regionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/regions/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to unlock region');
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unlock region';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { unlock, loading, error };
}

