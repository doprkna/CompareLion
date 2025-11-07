"use client";
import { useEffect, useState } from 'react';

interface ForkResultToastProps {
  show: boolean;
  summary: string;
  choice: 'A' | 'B';
  onClose: () => void;
}

export function ForkResultToast({ show, summary, choice, onClose }: ForkResultToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg z-50 transition-all ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">⚖️</span>
        <div className="font-semibold">Fork Choice: {choice}</div>
      </div>
      <div className="text-sm text-gray-700">{summary}</div>
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

