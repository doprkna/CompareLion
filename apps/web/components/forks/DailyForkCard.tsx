"use client";
import { useState } from 'react';

interface DailyForkCardProps {
  fork: {
    id: string;
    key: string;
    title: string;
    description?: string;
    optionA: string;
    optionB: string;
    rarity?: string;
    createdAt: string;
  };
  userChoice?: {
    choice: 'A' | 'B';
    resultSummary?: string;
    createdAt: string;
  } | null;
  onChoose: (forkId: string, choice: 'A' | 'B') => Promise<void>;
  choosing?: boolean;
}

export function DailyForkCard({ fork, userChoice, onChoose, choosing }: DailyForkCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);

  const handleChoose = async (choice: 'A' | 'B') => {
    setSelectedChoice(choice);
    try {
      await onChoose(fork.id, choice);
    } catch (e) {
      setSelectedChoice(null);
    }
  };

  const rarityColors: Record<string, string> = {
    common: 'border-gray-300',
    rare: 'border-blue-400',
    special: 'border-purple-400',
  };

  const rarityColor = rarityColors[fork.rarity || 'common'] || 'border-gray-300';

  return (
    <div className={`rounded border-2 p-4 mb-4 ${rarityColor} bg-gradient-to-br from-white to-gray-50`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">⚖️</span>
        <h3 className="text-lg font-semibold">🌅 {fork.title}</h3>
        {fork.rarity && fork.rarity !== 'common' && (
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">
            {fork.rarity}
          </span>
        )}
      </div>

      {fork.description && (
        <p className="text-sm text-gray-700 mb-4">{fork.description}</p>
      )}

      {userChoice ? (
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-1">
              You chose: {userChoice.choice === 'A' ? fork.optionA : fork.optionB}
            </div>
            {userChoice.resultSummary && (
              <div className="text-xs text-blue-700">{userChoice.resultSummary}</div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Chosen: {new Date(userChoice.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChoose('A')}
              disabled={choosing || selectedChoice !== null}
              className={`p-3 rounded border-2 transition ${
                selectedChoice === 'A'
                  ? 'bg-blue-100 border-blue-500 text-blue-900'
                  : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              } disabled:opacity-50`}
            >
              <div className="font-semibold mb-1">Option A</div>
              <div className="text-sm">{fork.optionA}</div>
            </button>

            <button
              onClick={() => handleChoose('B')}
              disabled={choosing || selectedChoice !== null}
              className={`p-3 rounded border-2 transition ${
                selectedChoice === 'B'
                  ? 'bg-blue-100 border-blue-500 text-blue-900'
                  : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              } disabled:opacity-50`}
            >
              <div className="font-semibold mb-1">Option B</div>
              <div className="text-sm">{fork.optionB}</div>
            </button>
          </div>

          {choosing && (
            <div className="text-center text-sm text-gray-600">Processing choice...</div>
          )}
        </div>
      )}
    </div>
  );
}

