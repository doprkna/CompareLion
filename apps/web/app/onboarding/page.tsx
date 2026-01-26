/**
 * Onboarding Page
 * v0.24.0 - Phase I: Smart Onboarding
 * 
 * Full-screen onboarding flow for new users
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import type { OnboardingData } from '@parel/types/onboarding';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [initialData, setInitialData] = useState<OnboardingData | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Fetch current onboarding state
      fetch('/api/onboarding/start', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.currentState) {
            setInitialData(data.data.currentState);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    router.push('/daily');
  };

  return <OnboardingFlow initialData={initialData} onComplete={handleComplete} />;
}
