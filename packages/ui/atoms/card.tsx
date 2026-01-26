'use client';

/**
 * Card Atom
 * v0.42.1 - C4 Step 2: Core atom implementation
 * Container for grouped content with elevation, borders, and padding
 */

import React from 'react';
import { Icon } from '@parel/ui/atoms';

export type CardVariant = 'base' | 'elevated' | 'bordered' | 'interactive';

export interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onClose?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  base: 'bg-white',
  elevated: 'bg-white shadow-md hover:shadow-lg transition-shadow',
  bordered: 'bg-white border border-gray-200',
  interactive: 'bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98]',
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'base',
  padding = 'md',
  header,
  footer,
  children,
  className = '',
  onClick,
  onClose,
}: CardProps) {
  const baseStyles = 'rounded-lg';
  const variantClass = variantStyles[variant];
  const paddingClass = paddingStyles[padding];
  const combinedStyles = `${baseStyles} ${variantClass} ${paddingClass} ${className}`.trim();

  const content = (
    <>
      {header && (
        <div className="mb-4 pb-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1">{header}</div>
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Close"
            >
              <Icon name="close" size="sm" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </>
  );

  if (onClick || variant === 'interactive') {
    return (
      <div
        className={combinedStyles}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={combinedStyles}>
      {content}
    </div>
  );
}
