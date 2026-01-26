/**
 * Feature Guard Component
 * Conditionally renders content based on feature flags
 * v0.35.12 - Admin/dev bypass with isAdminView
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FEATURES, isFeatureEnabled } from '@/lib/config';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isAdminView } from '@parel/core/utils/isAdminView';

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
  const featureEnabled = isFeatureEnabled(feature);

  // Admin/dev bypass
  if (isAdminView()) return <>{children}</>;

  // Handle redirect in useEffect to avoid "Cannot update a component while rendering" warning
  useEffect(() => {
    if (!featureEnabled && redirectTo) {
      router.push(redirectTo);
    }
  }, [featureEnabled, redirectTo, router]);

  if (!featureEnabled) {
    // If redirecting, show nothing (useEffect will handle redirect)
    if (redirectTo) {
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
