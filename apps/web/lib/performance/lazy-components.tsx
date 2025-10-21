/**
 * Lazy Component Loaders (v0.11.1)
 * 
 * Dynamic imports for code splitting and performance.
 */

'use client';

import dynamic from "next/dynamic";
import { Suspense } from "react";

/**
 * Loading fallback components
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
      <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
      <div className="h-4 bg-zinc-700 rounded w-5/6"></div>
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 bg-zinc-700 rounded"></div>
      ))}
    </div>
  );
}

/**
 * Lazy-loaded admin components
 */
export const AdminDashboard = dynamic(
  () => import("@/components/admin/AdminDashboard"),
  {
    loading: LoadingTable,
    ssr: false,
  }
);

/**
 * Lazy-loaded feed components
 */
export const FeedItem = dynamic(() => import("@/components/FeedItem"), {
  loading: LoadingCard,
});

/**
 * Lazy-loaded profile components
 */
export const HeroStats = dynamic(
  () => import("@/app/profile/components/HeroStats"),
  {
    loading: LoadingCard,
  }
);

export const InventoryModal = dynamic(
  () => import("@/app/profile/components/InventoryModal"),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

/**
 * Lazy-loaded chart components
 */
export const RechartsBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  {
    loading: LoadingCard,
    ssr: false,
  }
);

export const RechartsPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  {
    loading: LoadingCard,
    ssr: false,
  }
);

/**
 * Wrapper for Suspense boundaries
 */
export function LazyBoundary({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}











