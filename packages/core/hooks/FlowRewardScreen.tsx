// sanity-fix: Minimal FlowRewardScreen stub for packages/core
// This is a simplified version to prevent build errors
// The actual FlowRewardScreen component resides in the web app.

import React from 'react';

export interface FlowRewardData {
  // Minimal type stub
  [key: string]: any;
}

export interface FlowRewardScreenProps {
  open: boolean;
  onClose: () => void;
  data: FlowRewardData;
}

export function FlowRewardScreen(props: FlowRewardScreenProps) {
  // No-op component
  return null;
}

