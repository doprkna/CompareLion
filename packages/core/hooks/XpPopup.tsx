'use client';
// sanity-fix
// sanity-fix: Minimal stub for XpPopup to make @parel/core independent of web app
'use client';
import React from 'react';

export interface XpPopupProps {
  amount: number;
  offsetX?: number;
  offsetY?: number;
  variant?: string;
  onComplete?: () => void;
}

export function XpPopup({ onComplete }: XpPopupProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return null; // No-op component
}
