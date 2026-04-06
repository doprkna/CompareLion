'use client';

import { useMemo } from 'react';
import type { SigilStats } from '@parel/core';
import { generateSigil } from '@parel/core';

type Size = 'sm' | 'md' | 'lg';

interface ProfileSigilProps {
  userId: string;
  stats: SigilStats;
  size?: Size;
  className?: string;
}

const SIZE_MAP: Record<Size, number> = {
  sm: 32,
  md: 64,
  lg: 96,
};

export function ProfileSigil({ userId, stats, size = 'md', className }: ProfileSigilProps) {
  const { svg } = useMemo(() => generateSigil(userId, stats), [userId, stats]);
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <div
      className={className}
      style={{ width: px, height: px }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

