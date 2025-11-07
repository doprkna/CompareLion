"use client";

interface LootHistoryProps {
  loot: Array<{
    id: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    rewardType: 'xp' | 'gold' | 'item' | 'cosmetic' | 'emote';
    rewardValue: number;
    flavorText?: string;
    triggeredAt: string;
    redeemedAt: string | null;
    isRedeemed: boolean;
  }>;
  onRedeem?: (lootId: string) => Promise<void>;
  redeeming?: string | null;
}

export function LootHistory({ loot, onRedeem, redeeming }: LootHistoryProps) {
  const rarityColors: Record<string, { bg: string; border: string; icon: string }> = {
    common: { bg: 'bg-gray-100', border: 'border-gray-300', icon: '⚪' },
    rare: { bg: 'bg-blue-100', border: 'border-blue-300', icon: '🔵' },
    epic: { bg: 'bg-purple-100', border: 'border-purple-300', icon: '🟣' },
    legendary: { bg: 'bg-yellow-100', border: 'border-yellow-300', icon: '🟡' },
  };

  const rewardLabels: Record<string, string> = {
    xp: 'XP',
    gold: 'Gold',
    item: 'Item',
    cosmetic: 'Cosmetic',
    emote: 'Emote',
  };

  if (loot.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No loot moments yet. Keep playing to find rewards! 🎁
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {loot.map((item) => {
        const colors = rarityColors[item.rarity] || rarityColors.common;
        return (
          <div
            key={item.id}
            className={`p-3 rounded border ${colors.border} ${colors.bg} flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{colors.icon}</span>
              <div>
                <div className="font-semibold capitalize">{item.rarity}</div>
                <div className="text-sm text-gray-600">
                  +{item.rewardValue} {rewardLabels[item.rewardType] || item.rewardType}
                </div>
                {item.flavorText && (
                  <div className="text-xs text-gray-500 italic mt-1">"{item.flavorText}"</div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(item.triggeredAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              {item.isRedeemed ? (
                <span className="text-xs text-green-600 font-semibold">✓ Redeemed</span>
              ) : (
                onRedeem && (
                  <button
                    onClick={() => onRedeem(item.id)}
                    disabled={redeeming === item.id}
                    className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {redeeming === item.id ? 'Redeeming...' : 'Redeem'}
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

