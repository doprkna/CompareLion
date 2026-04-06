import { ReactNode } from 'react';
import type { XpPopupProps } from '@/components/XpPopup';
interface XpContextType {
    triggerXp: (amount: number, variant?: XpPopupProps['variant'], options?: {
        offsetX?: number;
        offsetY?: number;
    }) => void;
}
export declare function useXp(): XpContextType;
export declare function XpProvider({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export {};
