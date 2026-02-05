'use client';
// sanity-fix
/**
 * useFeedback Hook
 * Submits user feedback
 * v0.41.13 - Migrated to unified API client
 */

'use client';

import { useCallback, useState } from 'react';
import { defaultClient, ApiClientError } from '@parel/api'; // sanity-fix: replaced @parel/api/client with @parel/api (client not exported as subpath)

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
      const response = await defaultClient.post<SubmitFeedbackResult>('/feedback/submit', data);
      return response.data;
    } catch (e: unknown) {
      const errorMessage = e instanceof ApiClientError
        ? e.message
        : e instanceof Error
          ? e.message
          : 'Failed to submit feedback';
      setError(errorMessage);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitFeedback, loading, error };
}
