/**
 * LevelUpPopup Component
 *
 * Displays a celebration animation when user levels up.
 * Uses Framer Motion for smooth animations.
 */
interface LevelUpPopupProps {
    show: boolean;
    level: number;
    onComplete: () => void;
}
export declare function LevelUpPopup({ show, level, onComplete }: LevelUpPopupProps): import("react").JSX.Element;
export {};
