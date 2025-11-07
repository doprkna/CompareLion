'use client';

import { ReactNode } from 'react';

interface MobileOptimizedProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component for mobile-optimized layouts
 * Adds mobile-specific padding and spacing
 */
export function MobileOptimized({ children, className = '' }: MobileOptimizedProps) {
  return (
    <div className={`mobile-optimized ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized card component
 */
interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className = '', onClick }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-md
        p-4 sm:p-6
        active:scale-[0.98] transition-transform
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Mobile-optimized grid layout
 */
interface MobileGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileGrid({ 
  children, 
  cols = 2, 
  gap = 'md',
  className = '' 
}: MobileGridProps) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap];

  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }[cols];

  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized stack layout
 */
interface MobileStackProps {
  children: ReactNode;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileStack({ children, gap = 'md', className = '' }: MobileStackProps) {
  const gapClass = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  }[gap];

  return (
    <div className={`flex flex-col ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile bottom action bar
 */
interface MobileBottomBarProps {
  children: ReactNode;
  className?: string;
}

export function MobileBottomBar({ children, className = '' }: MobileBottomBarProps) {
  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-30
      bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700
      p-4 safe-area-bottom
      md:hidden
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * Mobile pull-to-refresh indicator
 */
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  return (
    <div className="pull-to-refresh-container">
      {children}
    </div>
  );
}

