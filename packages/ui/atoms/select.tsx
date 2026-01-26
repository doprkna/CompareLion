'use client';

/**
 * Select Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Dropdown selection component (single-select only, multi-select deferred)
 */

import React from 'react';
import { Icon } from '@parel/ui/atoms';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  disabled = false,
  label,
  placeholder,
  helperText,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0';
  const disabledStyles = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '';
  const combinedStyles = `${baseStyles} ${disabledStyles} ${className}`.trim();

  // Add placeholder option if provided
  const displayOptions = placeholder
    ? [{ value: '', label: placeholder, disabled: true }, ...options]
    : options;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          aria-describedby={helperId}
          className={`${combinedStyles} appearance-none pr-10`}
          {...props}
        >
          {displayOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <Icon name="chevron-down" size="sm" aria-hidden="true" />
        </div>
      </div>
      {helperText && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
