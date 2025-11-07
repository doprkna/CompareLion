"use client";
import { useEffect, useState } from 'react';

interface DuetSummaryModalProps {
  show: boolean;
  rewards: {
    xp: number;
    karma: number;
    synergyBonus: boolean;
    finishedOnTime: boolean;
  };
  partner: {
    id: string;
    name: string;
    image: string | null;
  };
  onClose: () => void;
}

export function DuetSummaryModal({
  show,
  rewards,
  partner,
  onClose,
}: DuetSummaryModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      setTimeout(() => setVisible(false), 300);
    }
  }, [show]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-transform ${
          visible ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🤝</div>
          <h2 className="text-2xl font-bold mb-2">Duet Run Complete!</h2>
          {rewards.synergyBonus && (
            <div className="text-sm text-purple-600 font-semibold mb-2">
              ✨ Synergy Bonus +10% ✨
            </div>
          )}
          {rewards.finishedOnTime && (
            <div className="text-sm text-green-600 font-semibold mb-2">
              ⏱️ Finished on time!
            </div>
          )}
        </div>

        {/* Partner Info */}
        <div className="flex items-center justify-center gap-3 mb-4 p-3 bg-purple-50 rounded">
          {partner.image && (
            <img
              src={partner.image}
              alt={partner.name}
              className="w-12 h-12 rounded-full border-2 border-purple-400"
            />
          )}
          <div className="font-semibold">{partner.name}</div>
        </div>

        {/* Rewards */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
            <span className="font-medium">XP Reward</span>
            <span className="font-bold text-blue-600">+{rewards.xp}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
            <span className="font-medium">Karma Reward</span>
            <span className="font-bold text-purple-600">+{rewards.karma}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded font-semibold hover:bg-purple-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

