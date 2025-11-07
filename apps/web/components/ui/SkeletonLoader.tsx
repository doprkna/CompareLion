'use client';

import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface SkeletonLoaderProps {
  variant?: 'default' | 'profile' | 'list';
  count?: number;
}

export function SkeletonLoader({ variant = 'default', count = 1 }: SkeletonLoaderProps) {
  if (variant === 'profile') {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section Skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-border animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-10 bg-border rounded animate-pulse w-2/3" />
              <div className="h-4 bg-border rounded animate-pulse w-1/3" />
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border-2 border-border rounded-xl p-4">
                <div className="h-4 bg-border rounded animate-pulse mb-4 w-1/2" />
                <div className="h-8 bg-border rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>

          {/* Progress Card Skeleton */}
          <Card className="bg-card border-2 border-border">
            <CardHeader>
              <div className="h-6 bg-border rounded animate-pulse w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-6 bg-border rounded-full animate-pulse" />
                <div className="h-4 bg-border rounded animate-pulse w-1/2 mx-auto" />
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card Skeleton */}
          <Card className="bg-card border-2 border-border">
            <CardHeader>
              <div className="h-6 bg-border rounded animate-pulse w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-bg border-2 border-border rounded-lg p-4">
                    <div className="h-12 w-12 bg-border rounded-full animate-pulse mx-auto mb-2" />
                    <div className="h-4 bg-border rounded animate-pulse mb-2" />
                    <div className="h-3 bg-border rounded animate-pulse w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
            <div className="w-12 h-12 bg-border rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-border rounded animate-pulse w-2/3" />
              <div className="h-3 bg-border rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default variant - simple shimmer boxes
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-24 bg-border rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export default SkeletonLoader;


























