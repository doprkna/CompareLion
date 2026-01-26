'use client';

/**
 * Radio Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Single selection from group (grouping handled externally)
 */

import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string; // Required for grouping
  value: string; // Required for form submission
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Radio({
  checked = false,
  onChange,
  name,
  value,
  disabled = false,
  label,
  className = '',
  id,
  ...props
}: RadioProps) {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  const baseStyles = 'w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const combinedStyles = `${baseStyles} ${disabledStyles} ${className}`.trim();

  const radio = (
    <input
      id={radioId}
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-checked={checked}
      className={combinedStyles}
      {...props}
    />
  );

  if (label) {
    return (
      <div className="flex items-center">
        {radio}
        <label htmlFor={radioId} className={`ml-2 text-sm text-gray-700 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          {label}
        </label>
      </div>
    );
  }

  return radio;
}
