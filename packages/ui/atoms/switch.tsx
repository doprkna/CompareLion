'use client';

/**
 * Switch Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Toggle for binary settings with proper role="switch" accessibility
 */

import React from 'react';
import { Icon } from '@parel/ui/atoms';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange' | 'size'> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label?: string;
  size?: SwitchSize;
  className?: string;
  showCheckIcon?: boolean; // Show check icon when checked
}

const sizeStyles: Record<SwitchSize, { track: string; thumb: string }> = {
  sm: { track: 'w-9 h-5', thumb: 'w-4 h-4' },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5' },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6' },
};

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
  className = '',
  id,
  showCheckIcon = false,
  ...props
}: SwitchProps) {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
  const sizeClass = sizeStyles[size];

  const trackStyles = `relative inline-flex items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${sizeClass.track}`;
  const trackColor = checked ? 'bg-blue-600' : 'bg-gray-300';
  const trackDisabled = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const combinedTrackStyles = `${trackStyles} ${trackColor} ${trackDisabled} ${className}`.trim();

  const thumbStyles = `inline-block rounded-full bg-white shadow transform transition-transform ${sizeClass.thumb}`;
  const thumbPosition = checked ? 'translate-x-full' : 'translate-x-0';
  const thumbMargin = size === 'sm' ? 'ml-0.5 mr-0.5' : size === 'md' ? 'ml-0.5 mr-0.5' : 'ml-0.5 mr-0.5';
  const combinedThumbStyles = `${thumbStyles} ${thumbPosition} ${thumbMargin}`;

  const switchElement = (
    <label htmlFor={switchId} className={combinedTrackStyles}>
      <input
        id={switchId}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-checked={checked}
        className="sr-only"
        {...props}
      />
      <span className={`${combinedThumbStyles} ${showCheckIcon && checked ? 'flex items-center justify-center' : ''}`}>
        {showCheckIcon && checked && (
          <Icon name="check" size={12} className="text-blue-600" aria-hidden="true" />
        )}
      </span>
    </label>
  );

  if (label) {
    return (
      <div className="flex items-center">
        {switchElement}
        <label htmlFor={switchId} className={`ml-3 text-sm text-gray-700 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          {label}
        </label>
      </div>
    );
  }

  return switchElement;
}
