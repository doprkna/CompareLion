/**
 * Mini Bar Component
 * Simple horizontal bar indicator for metrics
 * v0.38.9 - Mini Metric Bars UI
 */
interface MiniBarProps {
    label: string;
    value: number;
    className?: string;
}
export declare function MiniBar({ label, value, className }: MiniBarProps): import("react").JSX.Element;
export {};
