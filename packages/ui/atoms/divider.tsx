'use client';

/**
 * Divider Atom
 * v0.42.2 - C4 Step 3: Badge, Avatar, Divider, Spinner implementation
 * Visual separator between sections
 */

import React from 'react';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps {
  orientation?: DividerOrientation;
  className?: string;
}

export function Divider({
  orientation = 'horizontal',
  className = '',
}: DividerProps) {
  const horizontalStyles = 'w-full border-t border-gray-200 my-4';
  const verticalStyles = 'h-full border-l border-gray-200 mx-4 inline-block';
  
  const combinedStyles = orientation === 'horizontal' 
    ? `${horizontalStyles} ${className}`.trim()
    : `${verticalStyles} ${className}`.trim();

  return <div className={combinedStyles} role="separator" aria-orientation={orientation} />;
}
