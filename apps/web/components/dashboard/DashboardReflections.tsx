'use client';

/**
 * Dashboard Reflections Section
 * v0.19.5 - Integrated reflection components
 */

import { useEffect } from 'react';
import { MyReflectionCard } from './MyReflectionCard';
import { CompareToLastWeek } from './CompareToLastWeek';
import { QuoteOfTheDay } from './QuoteOfTheDay';

export function DashboardReflections() {
  useEffect(() => {
    // Initialize toast system
    if (typeof window !== 'undefined') {
      import('@/lib/toast');
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Quote of the Day - Top banner */}
      <QuoteOfTheDay />

      {/* Reflection and Comparison - Two column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyReflectionCard />
        <CompareToLastWeek />
      </div>
    </div>
  );
}

