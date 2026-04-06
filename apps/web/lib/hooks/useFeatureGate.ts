'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { canAccessFeature, type FeatureKey, type FeatureAccessResult, type FeatureGateUser } from '@parel/core/config/featureGates';

const LOCKED_SIGN_IN: FeatureAccessResult = {
  allowed: false,
  message: 'Sign in required.',
  reason: { custom: { message: 'Sign in required.' } },
};

const LOCKED_LOADING: FeatureAccessResult = {
  allowed: false,
  message: 'Loading...',
};

interface SessionUserLike {
  level?: number;
  role?: string;
}

/** Maps session user to gate user. Does NOT read isPremium (not in schema). */
function mapSessionUserToGateUser(user: SessionUserLike): FeatureGateUser {
  return {
    level: typeof user?.level === 'number' ? user.level : 1,
    role: typeof user?.role === 'string' ? user.role : 'USER',
    isBeta: false,
  };
}

/**
 * Client hook for feature gate checks.
 * Never throws. SSR-safe, loading-safe, admin-safe.
 */
export function useFeatureGate(featureKey: FeatureKey): FeatureAccessResult {
  const { data: session, status } = useSession();

  return useMemo(() => {
    if (status === 'loading') return LOCKED_LOADING;
    if (status !== 'authenticated' || !session?.user) return LOCKED_SIGN_IN;
    try {
      const gateUser = mapSessionUserToGateUser(session.user as SessionUserLike);
      return canAccessFeature(gateUser, featureKey);
    } catch {
      return LOCKED_SIGN_IN;
    }
  }, [session?.user, status, featureKey]);
}
