// sanity-fix: Minimal LifeRewardScreen stub for packages/core
// This is a simplified version to prevent build errors
// The actual LifeRewardScreen component resides in the web app.

import React from 'react';

export interface LifeRewardData {
  // Minimal type stub
  [key: string]: any;
}

export interface LifeRewardScreenProps {
  open: boolean;
  onClose: () => void;
  data: LifeRewardData;
}

export function LifeRewardScreen(props: LifeRewardScreenProps) {
  // No-op component
  return null;
}

