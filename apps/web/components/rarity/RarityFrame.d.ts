import { ReactNode } from 'react';
interface RarityFrameProps {
    rarity?: {
        key?: string;
        name?: string;
        colorPrimary?: string;
        colorGlow?: string;
        frameStyle?: string;
        rankOrder?: number;
        description?: string;
    } | string | null;
    children: ReactNode;
    className?: string;
}
export declare function RarityFrame({ rarity, children, className }: RarityFrameProps): import("react").JSX.Element;
export {};
