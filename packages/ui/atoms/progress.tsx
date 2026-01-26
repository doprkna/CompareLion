'use client';

/**
 * Progress Atom
 * v0.42.4 - C4 Step 5: Interaction atoms implementation
 * Progress indicator (bar only, circular deferred)
 */

import React from 'react';

export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps {
  value: number; // 0-100
  label?: string;
  size?: ProgressSize;
  className?: string;
}

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function Progress({
  value,
  label,
  size = 'md',
  className = '',
}: ProgressProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));
  const percentage = `${clampedValue}%`;

  const containerStyles = `w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]} ${className}`.trim();
  const barStyles = `h-full bg-blue-600 transition-all duration-300 ease-out rounded-full`;

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div
        className={containerStyles}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={barStyles}
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}
