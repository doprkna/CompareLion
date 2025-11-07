"use client";
import { useEffect, useState } from 'react';

interface LootRevealModalProps {
  show: boolean;
  loot: {
    id: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    rewardType: 'xp' | 'gold' | 'item' | 'cosmetic' | 'emote';
    rewardValue: number;
    flavorText?: string;
  };
  onRedeem: (lootId: string) => Promise<void>;
  onClose: () => void;
  redeeming?: boolean;
}

export function LootRevealModal({
  show,
  loot,
  onRedeem,
  onClose,
  redeeming,
}: LootRevealModalProps) {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 100);
    } else {
      setAnimate(false);
      setTimeout(() => setVisible(false), 500);
    }
  }, [show]);

  if (!show && !visible) return null;

  const rarityColors: Record<string, { bg: string; border: string; glow: string; icon: string }> = {
    common: {
      bg: 'bg-gray-100',
      border: 'border-gray-400',
      glow: 'shadow-gray-400',
      icon: '⚪',
    },
    rare: {
      bg: 'bg-blue-100',
      border: 'border-blue-400',
      glow: 'shadow-blue-400',
      icon: '🔵',
    },
    epic: {
      bg: 'bg-purple-100',
      border: 'border-purple-400',
      glow: 'shadow-purple-400',
      icon: '🟣',
    },
    legendary: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-400',
      glow: 'shadow-yellow-400',
      icon: '🟡',
    },
  };

  const colorScheme = rarityColors[loot.rarity] || rarityColors.common;

  const rewardLabels: Record<string, string> = {
    xp: 'XP',
    gold: 'Gold',
    item: 'Item',
    cosmetic: 'Cosmetic',
    emote: 'Emote',
  };

  const handleRedeem = async () => {
    try {
      await onRedeem(loot.id);
      setTimeout(onClose, 1000);
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg p-8 max-w-md w-full mx-4 transform transition-all ${
          animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${colorScheme.glow} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">{colorScheme.icon}</div>
          <h2 className="text-3xl font-bold mb-2 capitalize">
            {loot.rarity} Find!
          </h2>
          {loot.flavorText && (
            <p className="text-gray-600 italic mb-4">"{loot.flavorText}"</p>
          )}
        </div>

        <div className={`p-6 rounded-lg border-2 ${colorScheme.border} ${colorScheme.bg} mb-6`}>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              +{loot.rewardValue}
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {rewardLabels[loot.rewardType] || loot.rewardType}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRedeem}
            disabled={redeeming}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {redeeming ? 'Redeeming...' : 'Redeem Reward'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded font-semibold hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

