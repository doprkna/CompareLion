'use client';

import { useCallback, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export interface Feedback {
  id: string;
  userId?: string | null;
  user?: {
    id: string;
    username: string | null;
    name: string | null;
  } | null;
  message: string;
  screenshotUrl?: string | null;
  context?: string | null;
  status: 'NEW' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

interface SubmitFeedbackData {
  message: string;
  screenshotUrl?: string;
  context?: string;
}

interface SubmitFeedbackResult {
  success: boolean;
  feedback: {
    id: string;
    status: string;
    createdAt: string;
  };
  message: string;
}

export function useFeedback() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(async (data: SubmitFeedbackData): Promise<SubmitFeedbackResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to submit feedback');
      }
      return json;
    } catch (e: any) {
      setError(e?.message || 'Failed to submit feedback');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitFeedback, loading, error };
}

