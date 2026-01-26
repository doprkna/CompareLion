#!/usr/bin/env python3
"""Create loot UI components"""

import os

loot_dir = 'apps/web/components/loot'
os.makedirs(loot_dir, exist_ok=True)

# LootReveal component
loot_reveal = '''/**
 * Loot Reveal Component
 * Shows item drop with rarity color and animation
 * v0.36.30 - Loot System 2.0
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { getRarityColorClass, getRarityDisplayName } from '@/lib/rpg/rarity';

interface LootRevealProps {
  show: boolean;
  item: {
    id: string;
    name: string;
    emoji?: string;
    icon?: string;
    rarity: string;
  };
  onClose: () => void;
}

export function LootReveal({ show, item, onClose }: LootRevealProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  const rarityColor = getRarityColorClass(item.rarity);
  const emoji = item.emoji || item.icon || '📦';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={`bg-gray-900 border-2 ${rarityColor} max-w-md w-full mx-4 ${isAnimating ? 'animate-pulse' : ''}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-7xl mb-4 animate-bounce">
              {emoji}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
            <div className={`inline-block px-4 py-2 rounded-lg mb-4 ${rarityColor} border-2`}>
              <span className="font-bold text-white">
                {getRarityDisplayName(item.rarity)}
              </span>
            </div>
            <p className="text-gray-300 mb-6">Added to your inventory!</p>
            <Button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Package className="w-4 h-4 mr-2" />
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'''

# ChestOpening component
chest_opening = '''/**
 * Chest Opening Component
 * Shows chest opening animation and reveals items
 * v0.36.30 - Loot System 2.0
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Coins, Sparkles } from 'lucide-react';
import { getRarityColorClass, getRarityDisplayName } from '@/lib/rpg/rarity';

interface ChestReward {
  itemId: string;
  itemName: string;
  rarity: string;
  quantity: number;
}

interface ChestOpeningProps {
  show: boolean;
  chestType: string;
  items: ChestReward[];
  gold?: number;
  xp?: number;
  onClose: () => void;
}

export function ChestOpening({ show, chestType, items, gold, xp, onClose }: ChestOpeningProps) {
  const [isOpening, setIsOpening] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (show) {
      setIsOpening(true);
      setRevealed(false);
      const timer = setTimeout(() => {
        setIsOpening(false);
        setRevealed(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  const chestEmojis: Record<string, string> = {
    wooden: '📦',
    silver: '🥈',
    gold: '🥇',
    event: '🎁',
  };

  const chestEmoji = chestEmojis[chestType] || '📦';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="bg-gray-900 border-2 border-yellow-500 max-w-2xl w-full mx-4">
        <CardContent className="p-6">
          {isOpening ? (
            <div className="text-center">
              <div className="text-8xl mb-4 animate-bounce">
                {chestEmoji}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Opening Chest...</h2>
              <p className="text-gray-400">Revealing your rewards...</p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">{chestEmoji}</div>
                <h2 className="text-2xl font-bold text-white">Chest Opened!</h2>
              </div>
              <div className="space-y-4 mb-6">
                {items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Items ({items.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map((item, index) => {
                        const rarityColor = getRarityColorClass(item.rarity);
                        return (
                          <div
                            key={item.itemId}
                            className={`p-3 rounded-lg border-2 ${rarityColor} bg-gray-800`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">📦</div>
                              <div className="flex-1">
                                <div className="font-bold text-white">{item.itemName}</div>
                                <div className={`text-xs font-semibold ${rarityColor}`}>
                                  {getRarityDisplayName(item.rarity)}
                                </div>
                                {item.quantity > 1 && (
                                  <div className="text-xs text-gray-400">x{item.quantity}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {(gold || xp) && (
                  <div className="flex gap-4 justify-center">
                    {gold && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Coins className="w-5 h-5" />
                        <span className="font-bold">+{gold} Gold</span>
                      </div>
                    )}
                    {xp && (
                      <div className="flex items-center gap-2 text-blue-400">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold">+{xp} XP</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Collect Rewards
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
'''

with open(os.path.join(loot_dir, 'LootReveal.tsx'), 'w', encoding='utf-8') as f:
    f.write(loot_reveal)

with open(os.path.join(loot_dir, 'ChestOpening.tsx'), 'w', encoding='utf-8') as f:
    f.write(chest_opening)

print('Created LootReveal.tsx and ChestOpening.tsx')

