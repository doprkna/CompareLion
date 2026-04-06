'use client';

import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { useCallback } from 'react';
import { apiFetch } from '@/lib/apiBase';
import { useEventBus } from '@parel/core/hooks/useEventBus';

/**
 * Canonical gameplay stats from /api/user/summary.
 * Session is used only for auth state; progression comes from DB-backed summary.
 */
export interface UserSummary {
  id: string;
  name: string;
  email: string;
  image: string | null;
  avatarUrl?: string | null;
  level: number;
  xp: number;
  progress: number;
  funds: number;
  diamonds: number;
  streakCount: number;
  questionsAnswered: number;
  totalQuestions?: number;
  userResponses?: number;
  createdAt?: string;
  achievements?: Array<{
    id: string;
    code: string;
    title: string;
    description: string;
    icon: string | null;
    xpReward: number;
    earnedAt: string;
  }>;
}

interface SummaryApiResponse {
  success?: boolean;
  data?: { user?: UserSummary };
}

const SUMMARY_KEY = '/api/user/summary';

async function summaryFetcher(): Promise<UserSummary | null> {
  const res = await apiFetch<SummaryApiResponse>(SUMMARY_KEY);
  if (!res.ok || !res.data?.data?.user) return null;
  return res.data.data.user;
}

export function useUserSummary() {
  const { data: session, status } = useSession();
  const isReady = status !== 'loading';
  const isAuthenticated = !!session?.user;

  const { data, error, isLoading, mutate } = useSWR<UserSummary | null>(
    isReady && isAuthenticated ? SUMMARY_KEY : null,
    summaryFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      refreshInterval: 60000,
    }
  );

  useEventBus(
    'xp:update',
    useCallback(
      (eventData: { userId?: string }) => {
        if (session?.user?.id && eventData?.userId === session.user.id) {
          mutate();
        }
      },
      [session?.user?.id, mutate]
    )
  );

  return {
    data: data ?? null,
    isLoading: !isReady ? true : (isAuthenticated && isLoading),
    error,
    mutate,
    isAuthenticated,
  };
}
