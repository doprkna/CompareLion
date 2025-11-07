'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useXpPopup } from '@/hooks/useXpPopup';
import type { XpPopupProps } from '@/components/XpPopup';

interface XpContextType {
  triggerXp: (
    amount: number,
    variant?: XpPopupProps['variant'],
    options?: { offsetX?: number; offsetY?: number }
  ) => void;
}

const XpContext = createContext<XpContextType | null>(null);

export function useXp() {
  const context = useContext(XpContext);
  if (!context) {
    throw new Error('useXp must be used within XpProvider');
  }
  return context;
}

export function XpProvider({ children }: { children: ReactNode }) {
  const { triggerXp, XpPopupPortal } = useXpPopup();

  return (
    <XpContext.Provider value={{ triggerXp }}>
      {children}
      <XpPopupPortal />
    </XpContext.Provider>
  );
}













