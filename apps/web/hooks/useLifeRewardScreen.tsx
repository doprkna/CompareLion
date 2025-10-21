'use client';

import { useState, useCallback } from 'react';
import { LifeRewardScreen } from '@/components/LifeRewardScreen';
import type { LifeRewardData } from '@/components/LifeRewardScreen';

export function useLifeRewardScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [rewardData, setRewardData] = useState<LifeRewardData | null>(null);

  const triggerLifeReward = useCallback((data: LifeRewardData) => {
    setRewardData(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing data to allow exit animation
    setTimeout(() => setRewardData(null), 300);
  }, []);

  const LifeRewardScreenComponent = useCallback(() => {
    if (!rewardData) return null;

    return (
      <LifeRewardScreen
        open={isOpen}
        onClose={close}
        data={rewardData}
      />
    );
  }, [isOpen, rewardData, close]);

  return {
    triggerLifeReward,
    LifeRewardScreen: LifeRewardScreenComponent,
    isOpen,
    close,
  };
}

