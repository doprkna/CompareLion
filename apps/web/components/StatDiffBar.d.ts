/**
 * StatDiffBar Component
 *
 * Shows a comparison bar between two users' stats.
 * Visual diff with color-coded sides.
 */
interface StatDiffBarProps {
    statName: string;
    icon: string;
    color: string;
    leftValue: number;
    rightValue: number;
    leftName: string;
    rightName: string;
}
export default function StatDiffBar({ statName, icon, color, leftValue, rightValue, leftName, rightName, }: StatDiffBarProps): import("react").JSX.Element;
export {};
