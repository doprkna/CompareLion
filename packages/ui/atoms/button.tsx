'use client';

/**
 * Button Atom
 * v0.42.1 - C4 Step 2: Core atom implementation
 * Primary interactive element for user actions
 */

import React from 'react';
import { Icon } from '@parel/ui/atoms';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
  secondary: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
};

const sizeStyles: Record<ButtonSize, { padding: string; height: string; fontSize: string }> = {
  sm: { padding: 'px-3 py-1.5', height: 'h-8', fontSize: 'text-sm' },
  md: { padding: 'px-4 py-2', height: 'h-10', fontSize: 'text-base' },
  lg: { padding: 'px-6 py-3', height: 'h-12', fontSize: 'text-lg' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  onClick,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50';
  
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  const combinedStyles = `${baseStyles} ${variantClass} ${sizeClass.padding} ${sizeClass.height} ${sizeClass.fontSize} ${className}`;

  // Loading spinner using Icon registry
  const Spinner = () => (
    <Icon name="spinner" size="sm" className="animate-spin" aria-hidden="true" />
  );

  return (
    <button
      type="button"
      className={combinedStyles}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      {...props}
    >
      {loading && (
        <span className="mr-2">
          <Spinner />
        </span>
      )}
      {!loading && leftIcon && (
        <span className="mr-2 flex items-center">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="ml-2 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
}
