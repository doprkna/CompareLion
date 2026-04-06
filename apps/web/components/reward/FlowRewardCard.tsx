'use client';

/**
 * Minimal post-flow reward reveal (v0.48.01)
 */

import type { FlowReward } from '@parel/core';

function labelForType(t: FlowReward['type']): string {
  if (t === 'coins') return 'coins';
  if (t === 'xp') return 'XP';
  return 'diamonds';
}

function rarityLabel(r: FlowReward['rarity']): string {
  if (r === 'rare') return 'Rare';
  if (r === 'uncommon') return 'Uncommon';
  return 'Common';
}

/** Static-ish percentile for “more active than X%” line (cheap win). */
function fakeActivityPercentile(): number {
  return 55 + Math.floor(Math.random() * 28); // 55–82
}

export interface FlowRewardCardProps {
  reward: FlowReward;
}

export function FlowRewardCard({ reward }: FlowRewardCardProps) {
  const pct = fakeActivityPercentile();
  const line =
    reward.type === 'coins'
      ? `+${reward.amount} coins`
      : reward.type === 'xp'
        ? `+${reward.amount} XP`
        : `+${reward.amount} ${reward.amount === 1 ? 'diamond' : 'diamonds'}`;

  return (
    <div className="animate-flow-reward-pop mx-auto max-w-md rounded-xl border-2 border-accent/40 bg-card p-6 text-center shadow-lg">
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">{rarityLabel(reward.rarity)}</p>
      <p className="mt-2 text-lg font-semibold text-text">Nice. Here&apos;s your reward.</p>
      <p className="mt-3 text-2xl font-bold text-accent">{line}</p>
      <p className="mt-1 text-sm text-subtle capitalize">{labelForType(reward.type)}</p>
      {reward.rarity === 'rare' && (
        <p className="mt-2 text-sm font-medium text-accent">Rare drop!</p>
      )}
      <p className="mt-4 text-xs text-subtle">
        You were more active than {pct}% of players in this flow
      </p>
    </div>
  );
}
