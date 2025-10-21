'use client';

import { useState, useCallback } from 'react';
import { FlowRewardScreen } from '@/components/FlowRewardScreen';
import type { FlowRewardData } from '@/components/FlowRewardScreen';

export function useFlowRewardScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [rewardData, setRewardData] = useState<FlowRewardData | null>(null);

  const triggerFlowReward = useCallback((data: FlowRewardData) => {
    setRewardData(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing data to allow exit animation
    setTimeout(() => setRewardData(null), 300);
  }, []);

  const FlowRewardScreenComponent = useCallback(() => {
    if (!rewardData) return null;

    return (
      <FlowRewardScreen
        open={isOpen}
        onClose={close}
        data={rewardData}
      />
    );
  }, [isOpen, rewardData, close]);

  return {
    triggerFlowReward,
    FlowRewardScreen: FlowRewardScreenComponent,
    isOpen,
    close,
  };
}

