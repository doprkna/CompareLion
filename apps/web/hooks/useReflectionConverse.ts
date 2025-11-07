'use client';

import { useState } from 'react';

export interface ConversationResponse {
  id: string;
  response: string;
  modelUsed: string | null;
  toneLevel: number;
  createdAt: string;
}

export function useReflectionConverse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const converse = async (reflectionId: string, prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reflection/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflectionId, prompt }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to converse with reflection');
      }
      return data.conversation as ConversationResponse;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to converse';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { converse, loading, error };
}

export function useReflectionConversation(reflectionId: string | null) {
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = async () => {
    if (!reflectionId) {
      setConversation(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reflection/conversation/${reflectionId}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch conversation');
      }
      setConversation(data.conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
      setConversation(null);
    } finally {
      setLoading(false);
    }
  };

  return { conversation, loading, error, reload: fetchConversation };
}

