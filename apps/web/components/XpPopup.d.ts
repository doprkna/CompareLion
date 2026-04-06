export interface XpPopupProps {
    amount: number;
    onComplete: () => void;
    offsetX?: number;
    offsetY?: number;
    variant?: 'xp' | 'coins' | 'diamonds' | 'streak';
}
export declare function XpPopup({ amount, onComplete, offsetX, offsetY, variant, }: XpPopupProps): import("react").JSX.Element;
