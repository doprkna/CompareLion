/**
 * Comparison Panel Component
 * Display comparison data for rating results
 * v0.38.3 - Cross-Category Comparison View
 */
interface ComparisonPanelProps {
    requestId: string;
    category: string;
    className?: string;
}
export declare function ComparisonPanel({ requestId, category, className }: ComparisonPanelProps): import("react").JSX.Element | null;
export {};
