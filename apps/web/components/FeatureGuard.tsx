/**
 * Feature Guard Component
 * Conditionally renders content based on feature flags
 * v0.13.2p - Public Beta Release
 */

'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FEATURES, isFeatureEnabled } from '@/lib/config';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureGuardProps {
  feature: keyof typeof FEATURES;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function FeatureGuard({
  feature,
  children,
  fallback,
  redirectTo,
}: FeatureGuardProps) {
  const router = useRouter();

  if (!isFeatureEnabled(feature)) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    // Default fallback UI
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Construction className="h-16 w-16 mx-auto text-subtle opacity-50" />
            <h1 className="text-2xl font-bold text-text">Coming Soon</h1>
            <p className="text-subtle">
              This feature is currently under development and not available in the public beta.
            </p>
            <Button onClick={() => router.push('/main')} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if a feature is enabled
 */
export function useFeature(feature: keyof typeof FEATURES): boolean {
  return isFeatureEnabled(feature);
}

