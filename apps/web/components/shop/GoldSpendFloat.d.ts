interface GoldSpendFloatProps {
    amount: number;
    onComplete: () => void;
}
/**
 * Floating text showing gold spent (e.g., "-500 🪙")
 * Appears near gold counter and fades upward
 */
export declare function GoldSpendFloat({ amount, onComplete }: GoldSpendFloatProps): import("react").JSX.Element | null;
export {};
