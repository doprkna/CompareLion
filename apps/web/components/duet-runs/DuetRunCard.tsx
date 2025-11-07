"use client";
import { useEffect, useState } from 'react';

interface DuetRunCardProps {
  duetRun: {
    id: string;
    missionKey: string;
    title: string;
    description: string;
    type: 'reflect' | 'collect' | 'challenge';
    durationSec: number;
    startedAt: string;
    remainingSec: number;
    partner: {
      id: string;
      name: string;
      image: string | null;
    };
    myProgress: number;
    partnerProgress: number;
    bothCompleted: boolean;
  };
  onProgress?: (duetRunId: string, progress: number) => Promise<void>;
  onComplete?: (duetRunId: string) => Promise<void>;
  updating?: boolean;
}

export function DuetRunCard({ duetRun, onProgress, onComplete, updating }: DuetRunCardProps) {
  const [remaining, setRemaining] = useState(duetRun.remainingSec);
  const [localProgress, setLocalProgress] = useState(duetRun.myProgress);

  useEffect(() => {
    setRemaining(duetRun.remainingSec);
  }, [duetRun.remainingSec]);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = async (progress: number) => {
    setLocalProgress(progress);
    if (onProgress) {
      await onProgress(duetRun.id, progress);
    }
  };

  const handleComplete = async () => {
    if (onComplete && duetRun.bothCompleted) {
      await onComplete(duetRun.id);
    }
  };

  const missionTypeLabels: Record<string, string> = {
    reflect: 'Reflect',
    collect: 'Collect',
    challenge: 'Challenge',
  };

  return (
    <div className="rounded border-2 border-purple-400 p-4 mb-4 bg-gradient-to-br from-white to-purple-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤝</span>
          <h3 className="text-lg font-semibold">Duet Run: {duetRun.title}</h3>
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">
            {missionTypeLabels[duetRun.type] || duetRun.type}
          </span>
        </div>
        <div className="text-sm font-semibold text-purple-700">
          ⏱️ {formatTime(remaining)} remaining
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700 mb-3">{duetRun.description}</p>

        {/* Partner Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="text-sm text-gray-600">Partner:</div>
          {duetRun.partner.image && (
            <img
              src={duetRun.partner.image}
              alt={duetRun.partner.name}
              className="w-8 h-8 rounded-full border-2 border-purple-400"
            />
          )}
          <div className="font-semibold">{duetRun.partner.name}</div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Your Progress</span>
              <span>{duetRun.myProgress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${duetRun.myProgress}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Partner Progress</span>
              <span>{duetRun.partnerProgress}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${duetRun.partnerProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Controls */}
      {duetRun.type === 'collect' && (
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="100"
            value={localProgress}
            onChange={(e) => handleProgressChange(Number(e.target.value))}
            disabled={updating || duetRun.bothCompleted}
            className="w-full"
          />
        </div>
      )}

      {/* Complete Button */}
      {duetRun.bothCompleted && (
        <button
          onClick={handleComplete}
          disabled={updating}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded font-semibold hover:bg-purple-700 disabled:opacity-50"
        >
          {updating ? 'Processing...' : 'Complete & Claim Rewards'}
        </button>
      )}

      {updating && (
        <div className="text-center text-sm text-gray-600 mt-2">Updating...</div>
      )}
    </div>
  );
}

