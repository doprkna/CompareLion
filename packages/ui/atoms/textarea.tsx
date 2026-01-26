'use client';

/**
 * Textarea Atom
 * v0.42.3 - C4 Step 4: Form atoms implementation
 * Multi-line text input with validation, character count, and auto-resize
 */

import React, { useRef, useEffect } from 'react';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  rows?: number;
  autoResize?: boolean;
  helperText?: string;
  className?: string;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  errorMessage,
  rows = 4,
  autoResize = false,
  helperText,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText ? `${textareaId}-helper` : undefined;
  const ariaDescribedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const baseStyles = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none';
  const disabledStyles = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500';
  const combinedStyles = `${baseStyles} ${disabledStyles} ${errorStyles} ${className}`.trim();

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={autoResize ? 1 : rows}
        aria-invalid={error}
        aria-describedby={ariaDescribedBy}
        className={combinedStyles}
        {...props}
      />
      {error && errorMessage && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
