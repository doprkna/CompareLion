"use client";
import { useEffect, useState } from "react";

interface DamageNumberProps {
  damage: number;
  isCrit: boolean;
  x: number; // Position relative to container
  y: number;
  onComplete: () => void;
}

export function DamageNumber({ damage, isCrit, x, y, onComplete }: DamageNumberProps) {
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
    <div
      className="absolute pointer-events-none animate-damage-float z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <span
        className={`font-bold drop-shadow-lg ${
          isCrit
            ? "text-3xl text-yellow-300 animate-pulse"
            : "text-xl text-red-400"
        }`}
      >
        {isCrit && "💥 "}
        {damage}
        {isCrit && "!"}
      </span>
    </div>
  );
}


