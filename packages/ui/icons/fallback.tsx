/**
 * Fallback Icon Component
 * v0.42.7 - C5 Step 2: Icon Registry Engine
 * 
 * Displays a placeholder icon when the requested icon is missing or fails to load.
 * Logs missing icon names in development mode.
 */

'use client';

import React from 'react';
import type { IconSvgProps } from './registry';

export interface FallbackIconProps extends IconSvgProps {
  missingName?: string; // Icon name that was requested but not found
}

// Track logged warnings to avoid spam
const loggedWarnings = new Set<string>();

/**
 * Fallback Icon Component
 * 
 * Simple placeholder SVG that displays when an icon is missing.
 * Shows a box with a question mark in development mode.
 */
export function FallbackIcon({
  size = 24,
  className = '',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  missingName,
}: FallbackIconProps) {
  const pixelSize = typeof size === 'number' ? size : 24;

  // Log missing icon in development mode (once per name)
  if (process.env.NODE_ENV === 'development' && missingName) {
    if (!loggedWarnings.has(missingName)) {
      console.warn(`[Icon] Icon not found or failed to load: "${missingName}". Using fallback.`);
      loggedWarnings.add(missingName);
    }
  }

  // Determine accessibility attributes
  const isHidden = ariaHidden !== undefined ? ariaHidden : !ariaLabel;
  const accessibilityProps = isHidden
    ? { 'aria-hidden': true }
    : { 'aria-label': ariaLabel || 'Missing icon' };

  const baseStyles = 'inline-block flex-shrink-0 text-gray-400';
  const combinedStyles = `${baseStyles} ${className}`.trim();

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={combinedStyles}
      {...accessibilityProps}
    >
      {/* Box outline */}
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Question mark */}
      <circle cx="12" cy="10" r="2" fill="currentColor" />
      <path
        d="M12 14v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Show icon name in dev mode (small text) */}
      {process.env.NODE_ENV === 'development' && missingName && (
        <text
          x="12"
          y="20"
          fontSize="6"
          textAnchor="middle"
          fill="currentColor"
          opacity="0.5"
        >
          {missingName.length > 8 ? missingName.substring(0, 8) + '...' : missingName}
        </text>
      )}
    </svg>
  );
}

