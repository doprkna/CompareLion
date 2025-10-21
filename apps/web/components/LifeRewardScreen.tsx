'use client';

import { RewardModal, type RewardItem, type DropItem } from './RewardModal';

export interface LifeRewardData {
  hearts: number;
  food: number;
  xpLost?: number;
  goldLost?: number;
  questionsAttempted?: number;
  timeSpent?: number;
  drops?: DropItem[];
  onBuyHearts?: () => void;
  onBuyFood?: () => void;
  onReturnHome?: () => void;
}

export interface LifeRewardScreenProps {
  open: boolean;
  onClose: () => void;
  data: LifeRewardData;
}

export function LifeRewardScreen({ open, onClose, data }: LifeRewardScreenProps) {
  // Build rewards array (showing losses/current state)
  const rewards: RewardItem[] = [
    {
      type: 'hearts',
      amount: data.hearts,
      label: 'Hearts',
      emoji: '💔',
      color: '#ef4444',
    },
    {
      type: 'food',
      amount: data.food,
      label: 'Food',
      emoji: '🍽️',
      color: '#f97316',
    },
  ];
  
  if (data.xpLost && data.xpLost > 0) {
    rewards.push({
      type: 'xp',
      amount: data.xpLost,
      label: 'XP Lost',
      emoji: '💫',
      color: '#64748b',
    });
  }
  
  if (data.goldLost && data.goldLost > 0) {
    rewards.push({
      type: 'gold',
      amount: data.goldLost,
      label: 'Gold Lost',
      emoji: '💸',
      color: '#64748b',
    });
  }

  // Build stats array
  const stats = [];
  
  if (data.questionsAttempted !== undefined) {
    stats.push({ label: 'Questions Attempted', value: data.questionsAttempted });
  }
  
  if (data.timeSpent !== undefined) {
    stats.push({ label: 'Time Spent', value: `${data.timeSpent}s` });
  }

  // Build actions
  const actions = [];
  
  if (data.onBuyHearts) {
    actions.push({
      label: 'Buy Hearts ❤️',
      onClick: () => {
        data.onBuyHearts?.();
        onClose();
      },
      variant: 'default' as const,
      primary: true,
    });
  }
  
  if (data.onBuyFood) {
    actions.push({
      label: 'Buy Food 🍖',
      onClick: () => {
        data.onBuyFood?.();
        onClose();
      },
      variant: 'outline' as const,
    });
  }
  
  actions.push({
    label: 'Return Home',
    onClick: () => {
      data.onReturnHome?.();
      onClose();
    },
    variant: 'ghost' as const,
  });

  return (
    <RewardModal
      open={open}
      onClose={onClose}
      title="Out of Energy! ⚡"
      subtitle="You need to recharge to continue..."
      rewards={rewards}
      drops={data.drops}
      stats={stats.length > 0 ? stats : undefined}
      actions={actions}
      type="warning"
    />
  );
}











