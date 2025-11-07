'use client';

import { useState } from 'react';

export interface QuestLore {
  text: string;
  tone: 'serious' | 'comedic' | 'poetic';
}

export function useQuestLore(questId: string | null) {
  const [lore, setLore] = useState<QuestLore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLore = async () => {
    if (!questId) {
      setLore(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quests?includeLore=true`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch quest lore');
      }
      
      const quest = data.quests?.find((q: any) => q.questId === questId);
      if (quest?.lore) {
        setLore(quest.lore);
      } else {
        setLore(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lore');
      setLore(null);
    } finally {
      setLoading(false);
    }
  };

  return { lore, loading, error, fetchLore };
}

export function useQuestClaimWithLore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lore, setLore] = useState<QuestLore | null>(null);

  const claimWithLore = async (userQuestId: string) => {
    setLoading(true);
    setError(null);
    setLore(null);
    try {
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuestId }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to claim quest');
      }
      
      // Set lore if returned
      if (data.lore) {
        setLore(data.lore);
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim quest';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { claimWithLore, loading, error, lore };
}

