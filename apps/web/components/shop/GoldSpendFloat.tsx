"use client";
import { useEffect, useState } from 'react';

interface GoldSpendFloatProps {
  amount: number;
  onComplete: () => void;
}

/**
 * Floating text showing gold spent (e.g., "-500 🪙")
 * Appears near gold counter and fades upward
 */
export function GoldSpendFloat({ amount, onComplete }: GoldSpendFloatProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute -top-8 right-0 pointer-events-none z-50 animate-damage-float">
      <span className="text-lg font-bold text-red-400 drop-shadow-lg">
        -{amount.toLocaleString()} 🪙
      </span>
    </div>
  );
}

