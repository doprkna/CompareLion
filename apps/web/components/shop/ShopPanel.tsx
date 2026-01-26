"use client";

import { useState } from 'react';
import { useShop } from '@parel/core/hooks/useShop';
import { useGold } from '@parel/core/hooks/useGold';
import { useCombatPreferences } from '@parel/core/hooks/useCombatPreferences';
import { useSfx } from '@parel/core/hooks/useSfx'; // v0.26.13
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { RpgButton } from '@/components/rpg/RpgButton';
import { ShoppingBag } from 'lucide-react';
import { GoldSpendFloat } from './GoldSpendFloat';

const RARITY_COLORS: Record<string, string> = {
  common: 'border-gray-500 text-gray-300',
  uncommon: 'border-green-500 text-green-300',
  rare: 'border-blue-500 text-blue-300',
  epic: 'border-purple-500 text-purple-300',
  legendary: 'border-yellow-500 text-yellow-300',
  alpha: 'border-amber-500 text-amber-300 border-2',
};

export default function ShopPanel() {
  const { items, loading, error, purchaseItem } = useShop();
  const { gold, loading: goldLoading } = useGold();
  const { preferences } = useCombatPreferences();
  const { play, vibrate } = useSfx(preferences.soundEnabled, preferences.hapticsEnabled); // v0.26.13
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [spendFloats, setSpendFloats] = useState<Array<{ id: number; amount: number }>>([]);
  const [floatIdCounter, setFloatIdCounter] = useState(0);

  const handlePurchase = async (key: string | null, itemName: string, price: number) => {
    if (!key) {
      console.error('Item has no key');
      return;
    }

    setPurchasing(key);
    try {
      const success = await purchaseItem(key);
      if (success) {
        // Show floating text for gold spent
        const id = floatIdCounter;
        setFloatIdCounter(id + 1);
        setSpendFloats((prev) => [...prev, { id, amount: price }]);
        
        // Sound feedback for purchase (v0.26.13)
        play('shop_buy', 0.4);
        vibrate([30]);
        
        // Dispatch wallet update event for real-time sync
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wallet:update'));
          window.dispatchEvent(new CustomEvent('inventory:refresh'));
        }
      }
    } finally {
      setPurchasing(null);
    }
  };

  const removeFloat = (id: number) => {
    setSpendFloats((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) {
    return <SkeletonLoader variant="card" count={3} />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400">Error loading shop: {error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Floating gold spend animations */}
      {spendFloats.map((float) => (
        <GoldSpendFloat
          key={float.id}
          amount={float.amount}
          onComplete={() => removeFloat(float.id)}
        />
      ))}
      
      <div>
        {items.length === 0 ? (
          <div className="text-center py-8 text-subtle">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No items available in the shop</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const canAfford = gold >= item.price;
              const rarityColor = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
              const isPurchasing = purchasing === item.key;

              return (
                <div
                  key={item.id}
                  className={`border-2 rounded-xl p-4 ${rarityColor} bg-card hover:bg-bg transition-all ${
                    !canAfford ? 'opacity-60' : ''
                  }`}
                >
                  {/* Item Emoji & Name */}
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">{item.emoji}</div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-subtle mt-1">{item.description}</p>
                    )}
                  </div>

                  {/* Stats */}
                  {(item.power || item.defense) && (
                    <div className="flex justify-center gap-3 text-xs mb-3">
                      {item.power && (
                        <div className="text-red-400">⚔️ {item.power}</div>
                      )}
                      {item.defense && (
                        <div className="text-blue-400">🛡️ {item.defense}</div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-yellow-400">
                      {item.price.toLocaleString()} 🪙
                    </div>
                    <div className="text-xs uppercase text-subtle mt-1">
                      {item.rarity}
                    </div>
                  </div>

                  {/* Buy Button */}
                  <RpgButton
                    onClick={() => handlePurchase(item.key, item.name, item.price)}
                    variant={!canAfford ? 'disabled' : isPurchasing ? 'disabled' : 'primary'}
                    className="w-full"
                  >
                    {isPurchasing ? (
                      '⏳ Purchasing...'
                    ) : !canAfford ? (
                      '⛔ Insufficient Gold'
                    ) : (
                      '🛒 Buy Now'
                    )}
                  </RpgButton>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

