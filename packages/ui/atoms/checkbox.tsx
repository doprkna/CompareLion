'use client';

/**
 * Checkbox Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Binary selection input with checked, unchecked, indeterminate, and disabled states
 */

import React, { useRef, useEffect } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  label?: string;
  className?: string;
}

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  label,
  className = '',
  id,
  ...props
}: CheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  // Handle indeterminate state
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const baseStyles = 'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const combinedStyles = `${baseStyles} ${disabledStyles} ${className}`.trim();

  const checkbox = (
    <input
      ref={checkboxRef}
      id={checkboxId}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-checked={indeterminate ? 'mixed' : checked}
      className={combinedStyles}
      {...props}
    />
  );

  if (label) {
    return (
      <div className="flex items-center">
        {checkbox}
        <label htmlFor={checkboxId} className={`ml-2 text-sm text-gray-700 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
          {label}
        </label>
      </div>
    );
  }

  return checkbox;
}
