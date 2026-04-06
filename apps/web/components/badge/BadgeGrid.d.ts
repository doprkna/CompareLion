import { Badge } from '@parel/core/hooks/useBadges';
interface BadgeGridProps {
    badges: Badge[];
    onBadgeClick?: (badge: Badge) => void;
    loading?: boolean;
}
export declare function BadgeGrid({ badges, onBadgeClick, loading }: BadgeGridProps): import("react").JSX.Element;
export {};
