"use client";
import { useEffect, useState } from 'react';

interface LootToastProps {
  show: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  message: string;
  onClose: () => void;
}

export function LootToast({ show, rarity, message, onClose }: LootToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  const rarityIcons: Record<string, string> = {
    common: '⚪',
    rare: '🔵',
    epic: '🟣',
    legendary: '🟡',
  };

  const icon = rarityIcons[rarity] || '✨';

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white border-2 border-purple-400 rounded-lg p-4 shadow-lg z-50 transition-all ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{icon}</span>
        <div className="font-semibold">✨ You've found something special!</div>
      </div>
      <div className="text-sm text-gray-700">{message}</div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
}

