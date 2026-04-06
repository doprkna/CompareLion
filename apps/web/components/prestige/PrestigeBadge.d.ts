interface PrestigeBadgeProps {
    prestigeCount: number;
    prestigeTitle?: string | null;
    prestigeColorTheme?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
export declare function PrestigeBadge({ prestigeCount, prestigeTitle, prestigeColorTheme, size, className }: PrestigeBadgeProps): import("react").JSX.Element | null;
export {};
