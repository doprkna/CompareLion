'use client';

import { RewardModal, type RewardItem, type DropItem } from './RewardModal';

export interface FlowRewardData {
  xp: number;
  gold: number;
  diamonds: number;
  hearts?: number;
  food?: number;
  questionsAnswered: number;
  accuracy?: number;
  time?: number;
  drops?: DropItem[];
  onNextFlow?: () => void;
  onReviewAnswers?: () => void;
  onBackToMain?: () => void;
}

export interface FlowRewardScreenProps {
  open: boolean;
  onClose: () => void;
  data: FlowRewardData;
}

export function FlowRewardScreen({ open, onClose, data }: FlowRewardScreenProps) {
  // Build rewards array
  const rewards: RewardItem[] = [];
  
  if (data.xp > 0) {
    rewards.push({
      type: 'xp',
      amount: data.xp,
      label: 'XP',
      emoji: '✨',
      color: 'var(--color-accent)',
    });
  }
  
  if (data.gold > 0) {
    rewards.push({
      type: 'gold',
      amount: data.gold,
      label: 'Coins',
      emoji: '💰',
      color: '#fbbf24',
    });
  }
  
  if (data.diamonds > 0) {
    rewards.push({
      type: 'diamonds',
      amount: data.diamonds,
      label: 'Diamonds',
      emoji: '💎',
      color: '#a855f7',
    });
  }
  
  if (data.hearts && data.hearts > 0) {
    rewards.push({
      type: 'hearts',
      amount: data.hearts,
      label: 'Hearts',
      emoji: '❤️',
      color: '#ef4444',
    });
  }
  
  if (data.food && data.food > 0) {
    rewards.push({
      type: 'food',
      amount: data.food,
      label: 'Food',
      emoji: '🍖',
      color: '#f97316',
    });
  }

  // Build stats array
  const stats = [
    { label: 'Questions', value: data.questionsAnswered },
  ];
  
  if (data.accuracy !== undefined) {
    stats.push({ label: 'Accuracy', value: `${data.accuracy}%` });
  }
  
  if (data.time !== undefined) {
    stats.push({ label: 'Time', value: `${data.time}s` });
  }

  // Build actions
  const actions = [
    {
      label: 'Next Flow',
      onClick: () => {
        data.onNextFlow?.();
        onClose();
      },
      variant: 'default' as const,
      primary: true,
    },
  ];
  
  if (data.onReviewAnswers) {
    actions.push({
      label: 'Review Answers',
      onClick: () => {
        data.onReviewAnswers?.();
        onClose();
      },
      variant: 'outline' as const,
    });
  }
  
  actions.push({
    label: 'Go to dashboard',
    onClick: () => {
      data.onBackToMain?.();
      onClose();
    },
    variant: 'ghost' as const,
  });

  return (
    <RewardModal
      open={open}
      onClose={onClose}
      title="Flow Complete! 🎉"
      subtitle="Great job! Here are your rewards:"
      rewards={rewards}
      drops={data.drops}
      stats={stats}
      actions={actions}
      type="success"
    />
  );
}













