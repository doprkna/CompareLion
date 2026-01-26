export interface XpPopupProps {
    amount: number;
    offsetX?: number;
    offsetY?: number;
    variant?: string;
    onComplete?: () => void;
}
export declare function XpPopup({ onComplete }: XpPopupProps): null;
