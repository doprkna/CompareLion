/**
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
