'use client';

/**
 * Skeleton Atom
 * v0.42.4 - C4 Step 5: Interaction atoms implementation
 * Loading placeholder with various shapes and lightweight animation
 */

import React from 'react';

export interface SkeletonProps {
  width?: string | number; // e.g., "100%", "200px", 200
  height?: string | number; // e.g., "20px", 20
  rounded?: boolean; // Use rounded corners
  circle?: boolean; // Circular shape (overrides rounded)
  className?: string;
}

function parseSize(value: string | number | undefined, defaultSize: string): string {
  if (!value) return defaultSize;
  if (typeof value === 'number') return `${value}px`;
  return value;
}

export function Skeleton({
  width,
  height,
  rounded = false,
  circle = false,
  className = '',
}: SkeletonProps) {
  const finalWidth = parseSize(width, '100%');
  const finalHeight = parseSize(height, circle ? finalWidth : '20px');
  const borderRadius = circle ? '50%' : rounded ? '0.375rem' : '0';

  const baseStyles = 'bg-gray-200 animate-pulse';
  const combinedStyles = `${baseStyles} ${className}`.trim();

  return (
    <div
      className={combinedStyles}
      style={{
        width: finalWidth,
        height: finalHeight,
        borderRadius,
      }}
      aria-label="Loading"
      role="status"
    />
  );
}
