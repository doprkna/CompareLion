interface DamageNumberProps {
    damage: number;
    isCrit: boolean;
    x: number;
    y: number;
    onComplete: () => void;
}
export declare function DamageNumber({ damage, isCrit, x, y, onComplete }: DamageNumberProps): import("react").JSX.Element | null;
export {};
