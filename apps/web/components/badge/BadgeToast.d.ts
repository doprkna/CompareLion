import { BadgeUnlockEvent } from '@parel/core/hooks/useBadgeNotification';
interface BadgeToastProps {
    badge: BadgeUnlockEvent | null;
    onClose: () => void;
}
export declare function BadgeToast({ badge, onClose }: BadgeToastProps): import("react").JSX.Element | null;
export {};
