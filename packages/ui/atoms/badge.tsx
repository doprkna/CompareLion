'use client';

/**
 * Badge Atom
 * v0.42.2 - C4 Step 3: Badge, Avatar, Divider, Spinner implementation
 * Small status or count indicator
 */

import React from 'react';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
};

const sizeStyles: Record<BadgeSize, { padding: string; fontSize: string }> = {
  sm: { padding: 'px-2 py-0.5', fontSize: 'text-xs' },
  md: { padding: 'px-2.5 py-1', fontSize: 'text-sm' },
};

export function Badge({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className = '',
}: BadgeProps) {
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  const baseStyles = 'inline-flex items-center rounded-full font-medium';
  const combinedStyles = `${baseStyles} ${variantClass} ${sizeClass.padding} ${sizeClass.fontSize} ${className}`.trim();

  return (
    <span className={combinedStyles}>
      {icon && <span className="mr-1.5 flex items-center">{icon}</span>}
      {children}
    </span>
  );
}
