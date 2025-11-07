"use client";
import { useEffect, useState } from 'react';

interface RitualToastProps {
  show: boolean;
  rewards: {
    xp: number;
    karma: number;
  };
  streakCount: number;
  onClose: () => void;
}

export function RitualToast({
  show,
  rewards,
  streakCount,
  onClose,
}: RitualToastProps) {
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

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white border-2 border-amber-500 rounded-lg p-4 shadow-lg z-50 transition-all ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🪶</span>
        <div className="font-semibold">Ritual Complete!</div>
      </div>
      <div className="text-sm space-y-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-semibold">+{rewards.xp} XP</span>
          <span className="text-purple-600 font-semibold">+{rewards.karma} Karma</span>
        </div>
        {streakCount > 1 && (
          <div className="text-amber-700 font-semibold">
            🔥 {streakCount} day streak!
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
      >
        ×
      </button>
    </div>
  );
}

