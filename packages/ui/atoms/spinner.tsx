'use client';

/**
 * Spinner Atom
 * v0.42.2 - C4 Step 3: Badge, Avatar, Divider, Spinner implementation
 * Loading indicator with accessible aria-label
 */

import React from 'react';
import { Icon } from '@parel/ui/atoms';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  'aria-label'?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Loading',
}: SpinnerProps) {
  const baseStyles = 'animate-spin text-gray-600';
  const combinedStyles = `${baseStyles} ${className}`.trim();

  return (
    <Icon
      name="spinner"
      size={size}
      className={combinedStyles}
      aria-label={ariaLabel}
    />
  );
}
