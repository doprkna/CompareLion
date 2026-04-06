import { Badge } from '@parel/core/hooks/useBadges';
interface BadgePopupProps {
    badge: Badge | null;
    onClose: () => void;
    onClaimed?: () => void;
}
export declare function BadgePopup({ badge, onClose, onClaimed }: BadgePopupProps): import("react").JSX.Element | null;
export {};
