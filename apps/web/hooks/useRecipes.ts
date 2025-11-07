'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export interface Recipe {
  id: string;
  itemId: string;
  item: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    description: string | null;
    icon: string | null;
    emoji: string | null;
    category: string | null;
    isCraftable: boolean;
  };
  ingredients: Array<{ itemId: string; quantity: number }>;
  craftTime: number;
  xpReward: number;
  discoveredBy: string | null;
  createdAt: string;
}

interface RecipesData {
  recipes: Recipe[];
  total: number;
}

export function useRecipes(itemId?: string, includeDiscovered = true) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (itemId) params.set('itemId', itemId);
      if (includeDiscovered) params.set('includeDiscovered', 'true');
      const data = await apiFetch<RecipesData>(`/api/items/recipes?${params.toString()}`);
      if (data) {
        setRecipes(data.recipes);
        setTotal(data.total);
      } else {
        setError('Failed to load recipes');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [itemId, includeDiscovered]);

  useEffect(() => {
    load();
  }, [load]);

  return { recipes, loading, error, total, reload: load };
}

