'use client';

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { XpPopup, type XpPopupProps } from '@/components/XpPopup';

interface XpInstance {
  id: string;
  amount: number;
  offsetX: number;
  offsetY: number;
  variant: XpPopupProps['variant'];
}

let globalIdCounter = 0;

export function useXpPopup() {
  const [instances, setInstances] = useState<XpInstance[]>([]);

  const triggerXp = useCallback(
    (
      amount: number,
      variant: XpPopupProps['variant'] = 'xp',
      options?: { offsetX?: number; offsetY?: number }
    ) => {
      const id = `xp-${Date.now()}-${globalIdCounter++}`;

      // Randomize X offset slightly for natural feel when multiple popups
      const baseOffsetX = options?.offsetX ?? 0;
      const randomOffsetX = baseOffsetX + (Math.random() - 0.5) * 60;
      const randomOffsetY = options?.offsetY ?? (Math.random() - 0.5) * 20;

      const newInstance: XpInstance = {
        id,
        amount,
        offsetX: randomOffsetX,
        offsetY: randomOffsetY,
        variant,
      };

      setInstances((prev) => [...prev, newInstance]);

      // Auto-remove after animation completes
      setTimeout(() => {
        setInstances((prev) => prev.filter((instance) => instance.id !== id));
      }, 1600);
    },
    []
  );

  const removeInstance = useCallback((id: string) => {
    setInstances((prev) => prev.filter((instance) => instance.id !== id));
  }, []);

  // Render portal with all active popups
  const XpPopupPortal = useCallback(() => {
    if (typeof window === 'undefined') return null;

    return createPortal(
      <>
        {instances.map((instance) => (
          <XpPopup
            key={instance.id}
            amount={instance.amount}
            offsetX={instance.offsetX}
            offsetY={instance.offsetY}
            variant={instance.variant}
            onComplete={() => removeInstance(instance.id)}
          />
        ))}
      </>,
      document.body
    );
  }, [instances, removeInstance]);

  return {
    triggerXp,
    XpPopupPortal,
  };
}

